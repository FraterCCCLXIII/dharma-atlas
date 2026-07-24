#!/usr/bin/env tsx
/**
 * Reverse-geocode thin pilgrimage place addresses into locality lines
 * (district / province / country), e.g. "Lumbini, Rupandehi, Lumbini Province, Nepal".
 *
 * Usage: npm run db:enrich-pilgrimage-addresses
 * Options:
 *   --limit=N     only process N places (for smoke tests)
 *   --slug=slug   only one pilgrimage_slug
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { places } from "../src/db/schema";
import { getPilgrimageSite } from "../src/data/pilgrimage";
import {
  isThinPilgrimageAddress,
  pilgrimagePlaceAddress,
} from "../src/lib/seed/pilgrimage-place-type";
import {
  formatLocalityAddress,
  reverseGeocodeLocality,
} from "../src/lib/seed/reverse-geocode-address";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const CACHE_PATH = join(
  process.cwd(),
  "scripts/pilgrimage-address-cache.json",
);

type Cache = Record<string, string>;

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

function loadCache(): Cache {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Cache;
  } catch {
    return {};
  }
}

function saveCache(cache: Cache) {
  writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);
}

/** Keep catalog country (e.g. Tibet) instead of Nominatim admin labels. */
function alignCatalogCountry(address: string, country: string): string {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return country;
  // Drop OSM region labels that duplicate catalog country semantics.
  const filtered = parts.filter(
    (part) => !/^xizang$/i.test(part) && !sameCountry(part, country),
  );
  filtered.push(country);
  return filtered.join(", ");
}

function sameCountry(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const slugArg = process.argv.find((a) => a.startsWith("--slug="));
const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : Infinity;
const onlySlug = slugArg?.slice("--slug=".length) || null;

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function main() {
  const cache = loadCache();
  const rows = await db
    .select({
      id: places.id,
      name: places.name,
      address: places.address,
      lat: places.lat,
      lng: places.lng,
      pilgrimageSlug: places.pilgrimageSlug,
      locationMode: places.locationMode,
    })
    .from(places)
    .where(
      and(
        eq(places.isPilgrimageSite, true),
        isNull(places.deletedAt),
        isNotNull(places.pilgrimageSlug),
      ),
    );

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let processed = 0;

  for (const row of rows) {
    if (!row.pilgrimageSlug) continue;
    if (onlySlug && row.pilgrimageSlug !== onlySlug) continue;

    const site = getPilgrimageSite(row.pilgrimageSlug);
    if (!site) {
      skipped += 1;
      continue;
    }
    if (!isThinPilgrimageAddress(row.address, site)) {
      skipped += 1;
      continue;
    }
    if (processed >= limit) break;
    processed += 1;

    const key = cacheKey(row.lat, row.lng);
    let nextAddress = cache[key];
    if (!nextAddress) {
      const zoom = row.locationMode === "area" ? 10 : 12;
      const parts = await reverseGeocodeLocality(row.lat, row.lng, { zoom });
      if (!parts) {
        failed += 1;
        console.warn(`fail ${row.pilgrimageSlug}: no reverse result`);
        continue;
      }
      nextAddress = formatLocalityAddress(site.name, site.country, parts);
      if (!nextAddress || nextAddress === pilgrimagePlaceAddress(site)) {
        // Still thin — keep trying higher detail once.
        const detail = await reverseGeocodeLocality(row.lat, row.lng, {
          zoom: 14,
        });
        if (detail) {
          nextAddress = formatLocalityAddress(site.name, site.country, detail);
        }
      }
      cache[key] = nextAddress;
      if (processed % 25 === 0) saveCache(cache);
    }

    nextAddress = alignCatalogCountry(nextAddress, site.country);
    cache[key] = nextAddress;

    if (!nextAddress || nextAddress === row.address) {
      skipped += 1;
      continue;
    }

    await db
      .update(places)
      .set({ address: nextAddress, updatedAt: new Date() })
      .where(eq(places.id, row.id));
    updated += 1;
    console.log(`${row.pilgrimageSlug}: ${row.address} → ${nextAddress}`);
  }

  saveCache(cache);
  console.log(
    `Done — updated ${updated}, skipped ${skipped}, failed ${failed}, processed ${processed}.`,
  );
}

main()
  .then(() => client.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    void client.end().finally(() => process.exit(1));
  });

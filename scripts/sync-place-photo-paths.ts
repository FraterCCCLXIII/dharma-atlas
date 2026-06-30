#!/usr/bin/env tsx
/**
 * Sync place photo paths in Postgres (and places.json) with files in public/places/.
 *
 * Fixes cases where real photos were downloaded to disk but DB still points at
 * generated SVG placeholders or an outdated path.
 *
 * Usage:
 *   npm run sync-place-photo-paths
 *   npm run sync-place-photo-paths -- --dry-run
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { places } from "../src/db/schema";
import { isGeneratedPlacePhoto } from "../src/lib/place-photo";
import type { Place, PlacesDataset } from "../src/types/place";

const ROOT = join(import.meta.dirname, "..");
const PLACES_DIR = join(ROOT, "public/places");
const PLACES_JSON = join(ROOT, "src/data/places.json");
const PHOTO_FILE = /^([a-f0-9]{12})\.(jpe?g|png|webp|gif|avif)$/i;

const DRY_RUN = process.argv.includes("--dry-run");

function localPath(filename: string): string {
  return `/places/${filename}`;
}

function pathExists(webPath: string): boolean {
  if (!webPath.startsWith("/places/")) return false;
  return existsSync(join(ROOT, "public", webPath.slice(1)));
}

function inferPhotoSource(place: Place, currentSource?: string | null): Place["photoSource"] {
  if (currentSource && currentSource !== "generated") {
    return currentSource as Place["photoSource"];
  }
  if (place.googlePlaceId) return "google_places";
  return "website";
}

function photosByPlaceId(files: string[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const file of files) {
    const match = file.match(PHOTO_FILE);
    if (match) map.set(match[1], file);
  }
  return map;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  if (!existsSync(PLACES_DIR)) {
    console.error(`Missing directory: ${PLACES_DIR}`);
    process.exit(1);
  }

  const diskPhotos = photosByPlaceId(readdirSync(PLACES_DIR));
  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);
  const rows = await db
    .select({
      id: places.id,
      name: places.name,
      photo: places.photo,
      photoSource: places.photoSource,
      googlePlaceId: places.googlePlaceId,
      qualityFlags: places.qualityFlags,
    })
    .from(places);

  const dataset = JSON.parse(readFileSync(PLACES_JSON, "utf8")) as PlacesDataset;
  const jsonById = new Map(dataset.places.map((place) => [place.id, place]));

  let updated = 0;
  let unchanged = 0;

  for (const row of rows) {
    const filename = diskPhotos.get(row.id);
    if (!filename) {
      unchanged++;
      continue;
    }

    const resolved = localPath(filename);
    const needsUpdate =
      !row.photo ||
      isGeneratedPlacePhoto(row.photo, row.photoSource) ||
      !pathExists(row.photo);

    if (!needsUpdate && row.photo === resolved) {
      unchanged++;
      continue;
    }

    const jsonPlace = jsonById.get(row.id);
    const nextSource = inferPhotoSource(
      {
        ...(jsonPlace ?? { id: row.id, name: row.name }),
        googlePlaceId: row.googlePlaceId ?? jsonPlace?.googlePlaceId,
      } as Place,
      row.photoSource,
    );
    const nextFlags = (row.qualityFlags ?? []).filter((flag) => flag !== "missing_photo");

    console.log(
      `  ${row.name}: ${row.photo || "(empty)"} → ${resolved} [${nextSource}]`,
    );
    updated++;

    if (!DRY_RUN) {
      await db
        .update(places)
        .set({
          photo: resolved,
          photoSource: nextSource,
          qualityFlags: nextFlags,
          updatedAt: new Date(),
        })
        .where(eq(places.id, row.id));
    }

    if (jsonPlace) {
      jsonPlace.photo = resolved;
      jsonPlace.photoSource = nextSource;
      jsonPlace.qualityFlags = nextFlags.length ? nextFlags : undefined;
    }
  }

  if (!DRY_RUN && updated > 0) {
    writeFileSync(PLACES_JSON, `${JSON.stringify(dataset, null, 2)}\n`);
  }

  await client.end();

  console.log(`\n${"─".repeat(60)}`);
  console.log(
    `Done${DRY_RUN ? " [dry-run]" : ""}: ${updated} photo paths updated, ${unchanged} unchanged`,
  );
}

main().catch((err) => {
  console.error("sync-place-photo-paths failed:", err);
  process.exit(1);
});

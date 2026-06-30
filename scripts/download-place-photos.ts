#!/usr/bin/env tsx
/**
 * Download real venue photos to public/places/.
 * Skips generated label placeholders — leaves photo blank when none found.
 *
 * Usage:
 *   npm run download-place-photos
 *   npm run download-place-photos -- --dry-run
 *   npm run download-place-photos -- --force
 *   npm run download-place-photos -- --limit=50
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { places } from "../src/db/schema";
import { isGeneratedPlacePhoto } from "../src/lib/place-photo";
import type { Place, PlacesDataset } from "../src/types/place";
import { isBadWebsite } from "../src/lib/place-quality";
import { USER_AGENT } from "./sources/http";
import { findVenueImage, needsPlacePhotoReplacement } from "./sources/place-imagesearch";

const ROOT = join(import.meta.dirname, "..");
const PLACES_JSON = join(ROOT, "src/data/places.json");
const OUTPUT_DIR = join(ROOT, "public/places");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const limitArg = args.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : 0;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

function extFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const match = pathname.match(/\.(jpe?g|png|webp|gif|avif)(?:$|\?)/);
    if (match) return `.${match[1].replace("jpeg", "jpg")}`;
  } catch {
    /* ignore */
  }
  return null;
}

function extFromContentType(contentType: string): string {
  const base = contentType.split(";")[0].trim().toLowerCase();
  return EXT_BY_TYPE[base] ?? ".jpg";
}

function localPhotoPath(id: string, ext: string): string {
  return `/places/${id}${ext}`;
}

function isRealLocalPhoto(photo: string | undefined | null): boolean {
  if (!photo?.startsWith("/places/")) return false;
  return !isGeneratedPlacePhoto(photo);
}

async function downloadImage(url: string, destPath: string): Promise<{ ext: string; bytes: number } | null> {
  await new Promise((r) => setTimeout(r, 300));

  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    },
    redirect: "follow",
  });

  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/") || contentType.includes("svg")) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 1200) return null;

  const ext = extFromUrl(url) ?? extFromContentType(contentType);
  const fullPath = `${destPath}${ext}`;

  if (!DRY_RUN) {
    writeFileSync(fullPath, buffer);
  }

  return { ext, bytes: buffer.length };
}

async function main() {
  if (!existsSync(OUTPUT_DIR) && !DRY_RUN) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const dataset = JSON.parse(readFileSync(PLACES_JSON, "utf8")) as PlacesDataset;
  let targets = dataset.places.filter(
    (p) => needsPlacePhotoReplacement(p.photo) || isGeneratedPlacePhoto(p.photo, p.photoSource) || FORCE,
  );
  if (LIMIT > 0) targets = targets.slice(0, LIMIT);

  console.log(
    `\n🖼  Place photos: ${targets.length} to process${DRY_RUN ? " [dry-run]" : ""}${FORCE ? " [force]" : ""}\n`,
  );

  let downloaded = 0;
  let skipped = 0;
  const dbUpdates: { id: string; photo: string | null; photoSource: string | null }[] = [];

  for (const place of targets) {
    const existingLocal =
      isRealLocalPhoto(place.photo) &&
      existsSync(join(ROOT, "public", place.photo!.slice(1)));

    if (existingLocal && !FORCE) continue;

    const website = place.website && !isBadWebsite(place.website) ? place.website : null;
    const found = await findVenueImage({
      name: place.name,
      type: place.type,
      website,
    });

    if (found) {
      const destBase = join(OUTPUT_DIR, place.id);
      const result = await downloadImage(found.url, destBase);
      if (result) {
        const localPath = localPhotoPath(place.id, result.ext);
        const photoSource: Place["photoSource"] =
          found.source === "website-og"
            ? "website"
            : found.source === "wikipedia" || found.source === "wikimedia"
              ? "wikimedia"
              : "website";

        place.photo = localPath;
        place.photoSource = photoSource;
        const flags = new Set(place.qualityFlags ?? []);
        flags.delete("missing_photo");
        place.qualityFlags = [...flags];
        dbUpdates.push({ id: place.id, photo: localPath, photoSource });
        downloaded++;
        console.log(`  💾 ${place.name} → ${localPath} (${Math.round(result.bytes / 1024)} KB)`);
        continue;
      }
    }

    if (isGeneratedPlacePhoto(place.photo, place.photoSource) || place.photo) {
      place.photo = undefined;
      place.photoSource = undefined;
      const flags = new Set(place.qualityFlags ?? []);
      flags.add("missing_photo");
      place.qualityFlags = [...flags];
      dbUpdates.push({ id: place.id, photo: null, photoSource: null });
    }
    skipped++;
  }

  if (!DRY_RUN) {
    writeFileSync(PLACES_JSON, `${JSON.stringify(dataset, null, 2)}\n`);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!DRY_RUN && databaseUrl && dbUpdates.length > 0) {
    const client = postgres(databaseUrl, { max: 1 });
    const db = drizzle(client);
    for (const update of dbUpdates) {
      await db
        .update(places)
        .set({
          photo: update.photo,
          photoSource: update.photoSource,
          updatedAt: new Date(),
        })
        .where(eq(places.id, update.id));
    }
    await client.end();
    console.log(`\nUpdated ${dbUpdates.length} rows in Postgres`);
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(`Done: ${downloaded} downloaded, ${skipped} left without photo`);
  if (DRY_RUN) console.log("(dry-run — no files or JSON written)\n");
}

main().catch((err) => {
  console.error("download-place-photos failed:", err);
  process.exit(1);
});

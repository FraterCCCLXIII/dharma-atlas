#!/usr/bin/env tsx
/**
 * Download teacher portrait images to public/teachers/ and point photo URLs at local files.
 *
 * For teachers without a photo (or with a broken URL), searches Wikipedia/Wikidata first.
 * Updates src/data/teachers.json and optionally the database when DATABASE_URL is set.
 *
 * Usage:
 *   npm run download-teacher-photos
 *   npm run download-teacher-photos -- --dry-run
 *   npm run download-teacher-photos -- --force
 *   npm run download-teacher-photos -- --discover-only   # find missing URLs only, no download
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { teachers } from "../src/db/schema";
import type { Teacher, TeachersDataset } from "../src/types/teacher";
import {
  findPortraitUrl,
  needsReplacement,
  verifyImageUrl,
} from "./sources/imagesearch";
import { USER_AGENT } from "./sources/http";

const ROOT = join(import.meta.dirname, "..");
const TEACHERS_JSON = join(ROOT, "src/data/teachers.json");
const OUTPUT_DIR = join(ROOT, "public/teachers");
const SOURCE_JSON = join(
  ROOT,
  "../Documents/github/spiritual-teachers/scripts/data/teachers.generated.json",
);

const MANUAL_PHOTO_URLS: Record<string, string> = {
  "john-main":
    "https://wccm.org/wp-content/uploads/2020/10/John-Main-OSB-headshot-square-300x300.jpg",
  "ilona-ciunaite": "https://meetingtruth.com/UserFiles/PublicUploads/Events/299.jpg",
  "john-of-the-cross":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Zurbar%C3%A1n_%28atribuido%29-John_of_the_Cross-1656.jpg/330px-Zurbar%C3%A1n_%28atribuido%29-John_of_the_Cross-1656.jpg",
};

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const DISCOVER_ONLY = args.includes("--discover-only");

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

function localPhotoPath(slug: string, ext: string): string {
  return `/teachers/${slug}${ext}`;
}

interface SourceMeta {
  wikipediaTitle?: string | null;
  wikidataId?: string | null;
}

function loadSourceMeta(): Map<string, SourceMeta> {
  const map = new Map<string, SourceMeta>();
  if (!existsSync(SOURCE_JSON)) return map;

  const raw = JSON.parse(readFileSync(SOURCE_JSON, "utf8")) as {
    slug: string;
    _source?: SourceMeta;
  }[];
  for (const row of raw) {
    if (row._source) map.set(row.slug, row._source);
  }
  return map;
}

async function resolveRemoteUrl(
  teacher: Teacher,
  sourceMeta: SourceMeta | undefined,
): Promise<string | null> {
  const photo = teacher.photo ?? "";

  if (!needsReplacement(photo)) {
    const ok = await verifyImageUrl(photo);
    if (ok) return photo;
  }

  console.log(`  🔍 ${teacher.name} — searching for portrait...`);
  const found = await findPortraitUrl({
    name: teacher.name,
    wikipediaTitle: sourceMeta?.wikipediaTitle,
    wikidataId: sourceMeta?.wikidataId,
  });
  if (found) {
    console.log(`  ✅ ${teacher.name} — found via ${found.source}`);
    return found.url;
  }

  console.warn(`  ⚠️  ${teacher.name} — no portrait found`);
  return MANUAL_PHOTO_URLS[teacher.slug] ?? null;
}

async function downloadImage(
  url: string,
  destPath: string,
): Promise<{ ext: string; bytes: number } | null> {
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
  if (buffer.length < 800) return null;

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

  const dataset = JSON.parse(readFileSync(TEACHERS_JSON, "utf8")) as TeachersDataset;
  const sourceMeta = loadSourceMeta();

  console.log(
    `\n🖼  Teacher photos: ${dataset.teachers.length} total${DRY_RUN ? " [dry-run]" : ""}${FORCE ? " [force]" : ""}\n`,
  );

  let downloaded = 0;
  let skipped = 0;
  let discovered = 0;
  let failed = 0;
  const dbUpdates: { slug: string; photo: string }[] = [];

  for (const teacher of dataset.teachers) {
    const existingLocal =
      teacher.photo.startsWith("/teachers/") &&
      existsSync(join(ROOT, "public", teacher.photo.slice(1)));

    if (existingLocal && !FORCE) {
      skipped++;
      continue;
    }

    let remoteUrl = teacher.photo;

    if (needsReplacement(remoteUrl)) {
      const resolved = await resolveRemoteUrl(teacher, sourceMeta.get(teacher.slug));
      if (!resolved) {
        failed++;
        continue;
      }
      if (resolved !== teacher.photo) {
        discovered++;
        teacher.photo = resolved;
      }
      remoteUrl = resolved;
    } else if (FORCE || !existingLocal) {
      const ok = await verifyImageUrl(remoteUrl);
      if (!ok) {
        const resolved = await resolveRemoteUrl(teacher, sourceMeta.get(teacher.slug));
        if (!resolved) {
          failed++;
          continue;
        }
        if (resolved !== teacher.photo) discovered++;
        teacher.photo = resolved;
        remoteUrl = resolved;
      }
    }

    if (DISCOVER_ONLY) continue;

    const destBase = join(OUTPUT_DIR, teacher.slug);
    const result = await downloadImage(remoteUrl, destBase);

    if (!result) {
      console.warn(`  ⚠️  ${teacher.name} — download failed (${remoteUrl})`);
      failed++;
      continue;
    }

    const localPath = localPhotoPath(teacher.slug, result.ext);
    teacher.photo = localPath;
    if (teacher.heroPhoto && !teacher.heroPhoto.startsWith("/teachers/")) {
      teacher.heroPhoto = localPath;
    }

    downloaded++;
    dbUpdates.push({ slug: teacher.slug, photo: localPath });
    console.log(`  💾 ${teacher.name} → ${localPath} (${Math.round(result.bytes / 1024)} KB)`);
  }

  if (!DRY_RUN && !DISCOVER_ONLY) {
    writeFileSync(TEACHERS_JSON, `${JSON.stringify(dataset, null, 2)}\n`);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!DRY_RUN && !DISCOVER_ONLY && databaseUrl && dbUpdates.length > 0) {
    const client = postgres(databaseUrl, { max: 1 });
    const db = drizzle(client);
    for (const update of dbUpdates) {
      await db
        .update(teachers)
        .set({ photo: update.photo, heroPhoto: update.photo })
        .where(eq(teachers.slug, update.slug));
    }
    await client.end();
    console.log(`\nUpdated ${dbUpdates.length} rows in Postgres`);
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log(
    `Done: ${downloaded} downloaded, ${discovered} URLs discovered, ${skipped} skipped, ${failed} failed`,
  );
  if (DRY_RUN) console.log("(dry-run — no files or JSON written)\n");
}

main().catch((err) => {
  console.error("download-teacher-photos failed:", err);
  process.exit(1);
});

#!/usr/bin/env tsx
/**
 * Add a batch of teachers from JSON, download portraits, update teachers.json, seed DB.
 *
 * Usage: tsx scripts/add-teachers-batch.ts scripts/data/integral-teachers-batch.json
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Teacher, TeachersDataset } from "../src/types/teacher";
import { findPortraitUrl } from "./sources/imagesearch";
import { USER_AGENT } from "./sources/http";

const ROOT = join(import.meta.dirname, "..");
const TEACHERS_JSON = join(ROOT, "src/data/teachers.json");
const OUTPUT_DIR = join(ROOT, "public/people");

type BatchEntry = Omit<Teacher, "photo" | "heroPhoto"> & {
  wikipediaTitle?: string;
  photoUrl?: string;
};

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

function extFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    const match = pathname.match(/\.(jpe?g|png|webp)(?:$|\?)/);
    if (match) return `.${match[1].replace("jpeg", "jpg")}`;
  } catch {
    /* ignore */
  }
  return ".jpg";
}

async function downloadImage(url: string, destBase: string): Promise<string | null> {
  await new Promise((r) => setTimeout(r, 400));
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
  const ext = extFromUrl(url);
  const fullPath = `${destBase}${ext}`;
  writeFileSync(fullPath, buffer);
  return `/people/${destBase.split("/").pop()}${ext}`;
}

async function resolvePhoto(entry: BatchEntry): Promise<string | null> {
  if (entry.photoUrl) return entry.photoUrl;
  const found = await findPortraitUrl({
    name: entry.name,
    wikipediaTitle: entry.wikipediaTitle,
  });
  return found?.url ?? null;
}

async function main() {
  const batchPath = process.argv[2] ?? join(ROOT, "scripts/data/integral-teachers-batch.json");
  const batch = JSON.parse(readFileSync(batchPath, "utf8")) as BatchEntry[];
  const dataset = JSON.parse(readFileSync(TEACHERS_JSON, "utf8")) as TeachersDataset;

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const existingSlugs = new Set(dataset.teachers.map((t) => t.slug));
  let added = 0;

  for (const entry of batch) {
    if (existingSlugs.has(entry.slug)) {
      console.log(`⏭  Skipping ${entry.name} (already exists)`);
      continue;
    }

    console.log(`📷 ${entry.name}…`);
    const remoteUrl = await resolvePhoto(entry);
    let photo = "";
    if (remoteUrl) {
      const local = await downloadImage(remoteUrl, join(OUTPUT_DIR, entry.slug));
      photo = local ?? "";
      if (photo) console.log(`   → ${photo}`);
      else console.warn(`   ⚠ download failed`);
    } else {
      console.warn(`   ⚠ no portrait found`);
    }

    const { wikipediaTitle: _w, photoUrl: _p, ...teacherFields } = entry;
    const teacher: Teacher = {
      ...teacherFields,
      photo,
      heroPhoto: photo || undefined,
      website: entry.website ?? undefined,
    };

    dataset.teachers.push(teacher);
    existingSlugs.add(entry.slug);
    added++;
  }

  dataset.count = dataset.teachers.length;
  dataset.teachers.sort((a, b) => a.name.localeCompare(b.name, "en"));
  writeFileSync(TEACHERS_JSON, `${JSON.stringify(dataset, null, 2)}\n`);

  console.log(`\n✅ Added ${added} teachers (${dataset.count} total)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env tsx
/**
 * Sync teacher photo paths in Postgres (and teachers.json) with files in public/people/.
 *
 * Fixes cases where image files were replaced on disk but DB paths still point at old extensions.
 *
 * Usage:
 *   npm run sync-teacher-photo-paths
 *   npm run sync-teacher-photo-paths -- --dry-run
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { teachers } from "../src/db/schema";
import type { TeachersDataset } from "../src/types/teacher";

const ROOT = join(import.meta.dirname, "..");
const TEACHERS_DIR = join(ROOT, "public/people");
const TEACHERS_JSON = join(ROOT, "src/data/teachers.json");

const DRY_RUN = process.argv.includes("--dry-run");

function portraitFilename(slug: string, files: string[]): string | null {
  const matches = files.filter((file) => file.startsWith(`${slug}.`) && !file.includes("-hero"));
  return matches[0] ?? null;
}

function heroFilename(slug: string, files: string[]): string | null {
  const matches = files.filter((file) => file.startsWith(`${slug}-hero.`));
  return matches[0] ?? null;
}

function localPath(filename: string): string {
  return `/people/${filename}`;
}

function pathExists(webPath: string): boolean {
  if (!webPath.startsWith("/people/") && !webPath.startsWith("/teachers/")) return false;
  const relative = webPath.startsWith("/people/")
    ? webPath.slice("/people/".length)
    : webPath.slice("/teachers/".length);
  return existsSync(join(TEACHERS_DIR, relative));
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  if (!existsSync(TEACHERS_DIR)) {
    console.error(`Missing directory: ${TEACHERS_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(TEACHERS_DIR);
  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);
  const rows = await db
    .select({
      slug: teachers.slug,
      name: teachers.name,
      photo: teachers.photo,
      heroPhoto: teachers.heroPhoto,
    })
    .from(teachers);

  const dataset = JSON.parse(readFileSync(TEACHERS_JSON, "utf8")) as TeachersDataset;
  const jsonBySlug = new Map(dataset.teachers.map((teacher) => [teacher.slug, teacher]));

  let photoUpdates = 0;
  let heroUpdates = 0;
  let unchanged = 0;

  for (const row of rows) {
    const portrait = portraitFilename(row.slug, files);
    const hero = heroFilename(row.slug, files);

    let nextPhoto = row.photo;
    if (portrait) {
      const resolved = localPath(portrait);
      if (nextPhoto !== resolved) {
        nextPhoto = resolved;
        photoUpdates++;
        console.log(`  photo  ${row.slug}: ${row.photo || "(empty)"} → ${resolved}`);
      }
    } else if (row.photo && !pathExists(row.photo)) {
      console.warn(`  ⚠️  ${row.slug}: no portrait file on disk (${row.photo})`);
    }

    let nextHero = row.heroPhoto;
    if (hero) {
      const resolved = localPath(hero);
      if (nextHero !== resolved) {
        nextHero = resolved;
        heroUpdates++;
        console.log(`  hero   ${row.slug}: ${row.heroPhoto || "(empty)"} → ${resolved}`);
      }
    } else if (row.heroPhoto && !pathExists(row.heroPhoto)) {
      nextHero = null;
      heroUpdates++;
      console.log(`  hero   ${row.slug}: cleared missing ${row.heroPhoto}`);
    }

    const changed = nextPhoto !== row.photo || nextHero !== row.heroPhoto;
    if (!changed) {
      unchanged++;
      continue;
    }

    if (!DRY_RUN) {
      await db
        .update(teachers)
        .set({
          photo: nextPhoto,
          heroPhoto: nextHero,
          updatedAt: new Date(),
        })
        .where(eq(teachers.slug, row.slug));
    }

    const jsonTeacher = jsonBySlug.get(row.slug);
    if (jsonTeacher) {
      jsonTeacher.photo = nextPhoto;
      jsonTeacher.heroPhoto = nextHero ?? undefined;
    }
  }

  if (!DRY_RUN) {
    writeFileSync(TEACHERS_JSON, `${JSON.stringify(dataset, null, 2)}\n`);
  }

  await client.end();

  console.log(`\n${"─".repeat(60)}`);
  console.log(
    `Done${DRY_RUN ? " [dry-run]" : ""}: ${photoUpdates} portrait paths updated, ${heroUpdates} hero paths updated, ${unchanged} unchanged`,
  );
}

main().catch((err) => {
  console.error("sync-teacher-photo-paths failed:", err);
  process.exit(1);
});

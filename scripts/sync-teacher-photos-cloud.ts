#!/usr/bin/env tsx
/**
 * Upload teacher portrait files that exist locally but return 404 on production.
 *
 * Usage:
 *   npm run cloud -- sync-teacher-photos [--dry-run] [--limit=N]
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createAdminApiClientFromEnv } from "./lib/admin-api-client";

type TeachersFile = {
  teachers: Array<{ slug: string; photo?: string; heroPhoto?: string }>;
};

function localPathFromWebPath(webPath: string): string | null {
  if (!webPath.startsWith("/people/")) return null;
  const relative = webPath.slice("/people/".length);
  if (relative.includes("..")) return null;
  return join(process.cwd(), "public/people", relative);
}

async function isMissingOnRemote(baseUrl: string, webPath: string): Promise<boolean> {
  const url = `${baseUrl.replace(/\/$/, "")}${webPath}`;
  const response = await fetch(url, { method: "HEAD" });
  return response.status === 404;
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : Infinity;

  const client = createAdminApiClientFromEnv();
  const baseUrl = process.env.REMOTE_APP_URL?.trim();
  if (!baseUrl) throw new Error("Set REMOTE_APP_URL in .env.local");

  const data = JSON.parse(readFileSync("src/data/teachers.json", "utf8")) as TeachersFile;
  const jobs: Array<{ slug: string; path: string; variant: "portrait" | "hero" }> = [];

  for (const teacher of data.teachers) {
    if (teacher.photo?.startsWith("/people/")) {
      const localPath = localPathFromWebPath(teacher.photo);
      if (localPath && existsSync(localPath)) {
        jobs.push({ slug: teacher.slug, path: localPath, variant: "portrait" });
      }
    }

    if (
      teacher.heroPhoto?.startsWith("/people/") &&
      teacher.heroPhoto !== teacher.photo
    ) {
      const localPath = localPathFromWebPath(teacher.heroPhoto);
      if (localPath && existsSync(localPath)) {
        jobs.push({ slug: teacher.slug, path: localPath, variant: "hero" });
      }
    }
  }

  let uploaded = 0;
  let skipped = 0;
  let missing = 0;
  const failed: Array<{ slug: string; variant: string; path: string; error: string }> = [];

  for (const job of jobs) {
    if (uploaded >= limit) break;

    const webPath = job.path.replace(join(process.cwd(), "public"), "").replace(/\\/g, "/");
    if (!(await isMissingOnRemote(baseUrl, webPath))) {
      skipped++;
      continue;
    }

    missing++;
    if (dryRun) {
      console.log(`would upload ${job.slug} (${job.variant}) ← ${webPath}`);
      uploaded++;
      continue;
    }

    try {
      await client.uploadTeacherPhoto(job.slug, job.path, job.variant);
      console.log(`uploaded ${job.slug} (${job.variant})`);
      uploaded++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`failed ${job.slug} (${job.variant}): ${message}`);
      failed.push({ slug: job.slug, variant: job.variant, path: webPath, error: message });
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        checked: jobs.length,
        missing,
        uploaded,
        skippedExisting: skipped,
        failed,
      },
      null,
      2,
    ),
  );

  if (failed.length > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

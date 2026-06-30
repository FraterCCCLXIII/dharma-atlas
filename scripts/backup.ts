#!/usr/bin/env tsx
/**
 * Create a backup of the Postgres database and local image directories.
 *
 * Usage:
 *   npm run backup
 *   npm run backup -- --archive
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createBackup } from "../src/lib/backup";

const ROOT = join(import.meta.dirname, "..");

function loadEnvFile(filename: string) {
  const path = join(ROOT, filename);
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

async function main() {
  const archive = process.argv.includes("--archive");

  console.log("Creating backup…");
  const result = await createBackup({ archive });

  console.log(`Backup id: ${result.id}`);
  console.log(`Directory: ${result.directory}`);
  console.log(
    `Database dump (${result.manifest.dumpMethod}): ${result.manifest.files.database}`,
  );
  console.log(
    `Images: ${result.manifest.counts.placeImages} place files, ${result.manifest.counts.peopleImages} people files`,
  );

  if (result.archivePath) {
    console.log(`Archive: ${result.archivePath}`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

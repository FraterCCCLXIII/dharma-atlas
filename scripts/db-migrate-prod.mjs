#!/usr/bin/env node
/**
 * Run Drizzle migrations in production (no drizzle-kit required).
 * Usage: node scripts/db-migrate-prod.mjs
 */

import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = join(__dirname, "..", "drizzle");

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const client = postgres(url, { max: 1, connect_timeout: 30 });

try {
  const db = drizzle(client);
  console.log("Running database migrations…");
  await migrate(db, { migrationsFolder });
  console.log("Database migrations complete.");
} catch (error) {
  console.error("Migration failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await client.end();
}

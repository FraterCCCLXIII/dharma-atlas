#!/usr/bin/env tsx
/**
 * Seed Postgres from src/data/places.json and src/data/teachers.json.
 * Idempotent: upserts by place id and teacher slug.
 *
 * Usage: npm run db:seed
 */

import postgres from "postgres";
import { runDataSeed } from "../src/lib/seed/run-seed";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local");
  process.exit(1);
}

const forceFields = process.argv
  .filter((arg) => arg.startsWith("--force-field="))
  .map((arg) => arg.slice("--force-field=".length));

const client = postgres(DATABASE_URL, { max: 1 });

async function main() {
  console.log("Loading JSON and seeding…");
  const result = await runDataSeed({
    fromFiles: true,
    forceFields,
    includeOntology: true,
  });

  console.log(
    `Done — ${result.places} places, ${result.teachers} teachers, ${result.ontologyNodes} ontology nodes.`,
  );
}

main()
  .then(() => client.end())
  .catch((err) => {
    console.error(err);
    void client.end();
    process.exit(1);
  });

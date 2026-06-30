#!/usr/bin/env tsx
/**
 * Export places from Postgres to src/data/places.json.
 *
 * Usage: npm run export-places
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { places } from "../src/db/schema";
import { rowToPlace } from "../src/lib/place-row";
import type { PlacesDataset } from "../src/types/place";

const ROOT = join(import.meta.dirname, "..");
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function main() {
  const rows = await db.select().from(places).orderBy(asc(places.name));
  const placeList = rows.map((row) => rowToPlace(row));

  const dataset: PlacesDataset = {
    source:
      "https://www.google.com/maps/d/u/0/viewer?mid=1NrKT9tt74PDeKaq9aFQ4FQZjSrVU9j4",
    sourceName: "Global Buddhist & Dharma Centers",
    sourceCredit:
      "Shambhala Publications, Office of Tibet, dhamma.org, BuddhaNet, Wolf K, Wikipedia",
    count: placeList.length,
    places: placeList,
  };

  const outPath = join(ROOT, "src/data/places.json");
  writeFileSync(outPath, `${JSON.stringify(dataset, null, 2)}\n`);
  console.log(`Exported ${placeList.length} places → ${outPath}`);
}

main()
  .then(() => client.end())
  .catch((err) => {
    console.error(err);
    void client.end();
    process.exit(1);
  });

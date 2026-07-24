#!/usr/bin/env tsx
/**
 * Seed pilgrimage sites into `places` and canonical routes into
 * `pilgrimage_routes` / `pilgrimage_route_stops`.
 *
 * Idempotent: re-runs match on `places.pilgrimage_slug`, optional overrides,
 * or name+~300m proximity before creating.
 *
 * Usage: npm run db:seed-pilgrimage
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { seedPilgrimagePlaces } from "../src/lib/seed/seed-pilgrimage-places";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function main() {
  console.log("Seeding pilgrimage places and routes…");
  const result = await seedPilgrimagePlaces(db);
  console.log(
    `Done — created ${result.created}, linked ${result.linked}, updated ${result.updated}; routes ${result.routes}, stops ${result.stops}, unmatched stops ${result.unmatchedStops}.`,
  );
}

main()
  .then(() => client.end())
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    void client.end().finally(() => process.exit(1));
  });

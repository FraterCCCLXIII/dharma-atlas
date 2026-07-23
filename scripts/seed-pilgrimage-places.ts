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

import { seedPilgrimagePlaces } from "../src/lib/seed/seed-pilgrimage-places";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local");
  process.exit(1);
}

async function main() {
  console.log("Seeding pilgrimage places and routes…");
  const result = await seedPilgrimagePlaces();
  console.log(
    `Done — created ${result.created}, linked ${result.linked}, updated ${result.updated}; routes ${result.routes}, stops ${result.stops}, unmatched stops ${result.unmatchedStops}.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

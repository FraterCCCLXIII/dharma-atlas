/**
 * Replace placeholder place slugs (slug === id) with pretty unique slugs.
 * Usage: bash -c 'set -a; source .env.local; set +a; npm run db:backfill-place-slugs'
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { and, eq, ne, or } from "drizzle-orm";
import postgres from "postgres";
import { places } from "../src/db/schema";
import {
  buildPlaceSlugCandidates,
  isValidPlaceSlug,
  normalizePlaceSlug,
} from "../src/lib/place-slug";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

async function isTaken(slug: string, excludePlaceId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: places.id })
    .from(places)
    .where(
      and(
        or(eq(places.slug, slug), eq(places.id, slug)),
        ne(places.id, excludePlaceId),
      ),
    )
    .limit(1);
  return Boolean(row);
}

async function allocate(input: {
  name: string;
  address: string;
  fallbackId: string;
}): Promise<string> {
  const candidates = buildPlaceSlugCandidates(input);
  for (const candidate of candidates) {
    if (!isValidPlaceSlug(candidate)) continue;
    if (!(await isTaken(candidate, input.fallbackId))) {
      return candidate;
    }
  }
  return normalizePlaceSlug(`${candidates[0] ?? "place"}-${Date.now().toString(36)}`);
}

async function main() {
  const rows = await db
    .select({
      id: places.id,
      name: places.name,
      address: places.address,
      slug: places.slug,
    })
    .from(places)
    .where(eq(places.slug, places.id));

  let updated = 0;
  for (const row of rows) {
    const slug = await allocate({
      name: row.name,
      address: row.address,
      fallbackId: row.id,
    });
    if (slug === row.slug) continue;
    await db
      .update(places)
      .set({ slug, updatedAt: new Date() })
      .where(eq(places.id, row.id));
    updated += 1;
    console.log(`${row.id} → ${slug}`);
  }

  console.log(`Updated ${updated} place slug(s).`);
  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  await client.end();
  process.exit(1);
});

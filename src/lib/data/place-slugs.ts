import { and, eq, ne, or } from "drizzle-orm";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import {
  buildPlaceSlugCandidates,
  isValidPlaceSlug,
  normalizePlaceSlug,
} from "@/lib/place-slug";

export async function isPlaceSlugTaken(
  slug: string,
  excludePlaceId?: string,
): Promise<boolean> {
  // Block collisions with another place's slug *or* id so /place/:param stays unambiguous.
  const filters = [or(eq(places.slug, slug), eq(places.id, slug))!];
  if (excludePlaceId) {
    filters.push(ne(places.id, excludePlaceId));
  }
  const [row] = await db
    .select({ id: places.id })
    .from(places)
    .where(and(...filters))
    .limit(1);
  return Boolean(row);
}

/** Allocate a unique slug from name/city/address. */
export async function allocateUniquePlaceSlug(input: {
  name: string;
  city?: string | null;
  address?: string | null;
  fallbackId?: string;
  excludePlaceId?: string;
}): Promise<string> {
  const candidates = buildPlaceSlugCandidates(input);
  for (const candidate of candidates) {
    if (!isValidPlaceSlug(candidate)) continue;
    if (!(await isPlaceSlugTaken(candidate, input.excludePlaceId))) {
      return candidate;
    }
  }

  // Extremely unlikely fallback.
  const stamp = Date.now().toString(36);
  return normalizePlaceSlug(`${candidates[0] ?? "place"}-${stamp}`);
}

/** Validate a manager/admin-provided slug and ensure uniqueness. */
export async function assertUniquePlaceSlug(
  rawSlug: string,
  excludePlaceId?: string,
): Promise<string> {
  const slug = normalizePlaceSlug(rawSlug);
  if (!isValidPlaceSlug(slug)) {
    throw new Error(
      "Slug must be 2–80 characters using lowercase letters, numbers, and hyphens.",
    );
  }
  if (await isPlaceSlugTaken(slug, excludePlaceId)) {
    throw new Error("That slug is already used by another place.");
  }
  return slug;
}

/** Replace placeholder slugs (equal to id) with pretty unique slugs. */
export async function backfillMissingPlaceSlugs(): Promise<number> {
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
    const slug = await allocateUniquePlaceSlug({
      name: row.name,
      address: row.address,
      fallbackId: row.id,
      excludePlaceId: row.id,
    });
    if (slug === row.slug) continue;
    await db
      .update(places)
      .set({ slug, updatedAt: new Date() })
      .where(eq(places.id, row.id));
    updated += 1;
  }
  return updated;
}

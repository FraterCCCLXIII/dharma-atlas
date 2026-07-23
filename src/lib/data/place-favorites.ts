import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { placeFavorites, places } from "@/db/schema";
import { attachPhotosToPlace } from "@/lib/data/place-photos";
import { rowToPlace } from "@/lib/place-row";
import type { Place } from "@/types/place";

export async function isPlaceFavorited(
  userId: string,
  placeId: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: placeFavorites.id })
    .from(placeFavorites)
    .where(
      and(eq(placeFavorites.userId, userId), eq(placeFavorites.placeId, placeId)),
    )
    .limit(1);

  return Boolean(row);
}

export async function listFavoritePlaceIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ placeId: placeFavorites.placeId })
    .from(placeFavorites)
    .where(eq(placeFavorites.userId, userId));

  return rows.map((row) => row.placeId);
}

/** Published, non-deleted favorites for a user — newest saved first. */
export async function getFavoritePlaces(userId: string): Promise<Place[]> {
  const rows = await db
    .select({ place: places })
    .from(placeFavorites)
    .innerJoin(places, eq(placeFavorites.placeId, places.id))
    .where(
      and(
        eq(placeFavorites.userId, userId),
        isNull(places.deletedAt),
        eq(places.isDraft, false),
      ),
    )
    .orderBy(desc(placeFavorites.createdAt));

  return Promise.all(
    rows.map((row) => attachPhotosToPlace(rowToPlace(row.place))),
  );
}

export async function addPlaceFavorite(
  userId: string,
  placeId: string,
): Promise<void> {
  await db
    .insert(placeFavorites)
    .values({ userId, placeId })
    .onConflictDoNothing({
      target: [placeFavorites.userId, placeFavorites.placeId],
    });
}

export async function removePlaceFavorite(
  userId: string,
  placeId: string,
): Promise<void> {
  await db
    .delete(placeFavorites)
    .where(
      and(eq(placeFavorites.userId, userId), eq(placeFavorites.placeId, placeId)),
    );
}

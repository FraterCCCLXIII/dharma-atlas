import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { placeMemberships, places } from "@/db/schema";
import { rowToPlace } from "@/lib/place-row";
import type { Place } from "@/types/place";

export interface PlaceMembership {
  id: number;
  userId: string;
  placeId: string;
  role: string;
  createdAt: Date;
}

function rowToMembership(row: typeof placeMemberships.$inferSelect): PlaceMembership {
  return {
    id: row.id,
    userId: row.userId,
    placeId: row.placeId,
    role: row.role,
    createdAt: row.createdAt,
  };
}

export async function getMembership(userId: string, placeId: string) {
  const [row] = await db
    .select()
    .from(placeMemberships)
    .where(and(eq(placeMemberships.userId, userId), eq(placeMemberships.placeId, placeId)))
    .limit(1);
  return row ? rowToMembership(row) : null;
}

export async function createMembership(data: {
  userId: string;
  placeId: string;
  role?: string;
}) {
  const [row] = await db
    .insert(placeMemberships)
    .values({
      userId: data.userId,
      placeId: data.placeId,
      role: data.role ?? "manager",
    })
    .onConflictDoNothing()
    .returning();
  return row ? rowToMembership(row) : null;
}

export async function getPlacesForUser(userId: string): Promise<Place[]> {
  const rows = await db
    .select({ place: places })
    .from(placeMemberships)
    .innerJoin(places, eq(placeMemberships.placeId, places.id))
    .where(eq(placeMemberships.userId, userId))
    .orderBy(places.name);

  return rows.map((row) => rowToPlace(row.place));
}

export async function userManagesPlace(userId: string, placeId: string) {
  const membership = await getMembership(userId, placeId);
  return Boolean(membership);
}

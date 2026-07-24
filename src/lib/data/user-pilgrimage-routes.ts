import "server-only";

import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { userPilgrimageRoutes, type UserPilgrimageRouteRow } from "@/db/schema";

function newId(): string {
  return crypto.randomUUID();
}

/** Short unlisted share token (URL-safe). */
function newShareId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export type UserPilgrimageRouteInput = {
  title: string;
  stopSlugs: string[];
  baseRouteSlug?: string | null;
  notes?: string | null;
};

export async function createUserPilgrimageRoute(
  userId: string,
  input: UserPilgrimageRouteInput,
): Promise<UserPilgrimageRouteRow> {
  const now = new Date();
  const [row] = await db
    .insert(userPilgrimageRoutes)
    .values({
      id: newId(),
      userId,
      title: input.title.trim(),
      baseRouteSlug: input.baseRouteSlug ?? null,
      stopSlugs: input.stopSlugs,
      shareId: newShareId(),
      notes: input.notes?.trim() || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (!row) throw new Error("Failed to create route");
  return row;
}

export async function updateUserPilgrimageRoute(
  userId: string,
  id: string,
  input: Partial<UserPilgrimageRouteInput>,
): Promise<UserPilgrimageRouteRow | null> {
  const patch: Partial<typeof userPilgrimageRoutes.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (input.title != null) patch.title = input.title.trim();
  if (input.stopSlugs != null) patch.stopSlugs = input.stopSlugs;
  if (input.baseRouteSlug !== undefined) {
    patch.baseRouteSlug = input.baseRouteSlug;
  }
  if (input.notes !== undefined) {
    patch.notes = input.notes?.trim() || null;
  }

  const [row] = await db
    .update(userPilgrimageRoutes)
    .set(patch)
    .where(
      and(eq(userPilgrimageRoutes.id, id), eq(userPilgrimageRoutes.userId, userId)),
    )
    .returning();

  return row ?? null;
}

export async function getUserPilgrimageRoute(
  userId: string,
  id: string,
): Promise<UserPilgrimageRouteRow | null> {
  const [row] = await db
    .select()
    .from(userPilgrimageRoutes)
    .where(
      and(eq(userPilgrimageRoutes.id, id), eq(userPilgrimageRoutes.userId, userId)),
    )
    .limit(1);
  return row ?? null;
}

export async function getUserPilgrimageRouteByShareId(
  shareId: string,
): Promise<UserPilgrimageRouteRow | null> {
  const [row] = await db
    .select()
    .from(userPilgrimageRoutes)
    .where(eq(userPilgrimageRoutes.shareId, shareId))
    .limit(1);
  return row ?? null;
}

export async function listUserPilgrimageRoutes(
  userId: string,
): Promise<UserPilgrimageRouteRow[]> {
  return db
    .select()
    .from(userPilgrimageRoutes)
    .where(eq(userPilgrimageRoutes.userId, userId))
    .orderBy(desc(userPilgrimageRoutes.updatedAt));
}

export async function deleteUserPilgrimageRoute(
  userId: string,
  id: string,
): Promise<boolean> {
  const deleted = await db
    .delete(userPilgrimageRoutes)
    .where(
      and(eq(userPilgrimageRoutes.id, id), eq(userPilgrimageRoutes.userId, userId)),
    )
    .returning({ id: userPilgrimageRoutes.id });
  return deleted.length > 0;
}

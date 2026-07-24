"use server";

import { inArray } from "drizzle-orm";
import { requireSession } from "@/lib/auth-server";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import { getPilgrimageSite } from "@/data/pilgrimage";
import {
  createUserPilgrimageRoute,
  deleteUserPilgrimageRoute,
  getUserPilgrimageRoute,
  updateUserPilgrimageRoute,
} from "@/lib/data/user-pilgrimage-routes";
import {
  isPlaceStopRef,
  placeIdFromStopRef,
} from "@/lib/pilgrimage-stop-ref";

async function sanitizeStopSlugs(stopSlugs: string[]): Promise<string[] | null> {
  if (!Array.isArray(stopSlugs) || stopSlugs.length === 0) return null;

  const cleaned = stopSlugs.map((s) => s.trim()).filter((s) => s.length > 0);
  if (cleaned.length === 0) return null;

  const placeIds = cleaned
    .map((ref) => placeIdFromStopRef(ref))
    .filter((id): id is string => Boolean(id));

  const validPlaceIds = new Set<string>();
  if (placeIds.length > 0) {
    const rows = await db
      .select({ id: places.id })
      .from(places)
      .where(inArray(places.id, placeIds));
    for (const row of rows) validPlaceIds.add(row.id);
  }

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const ref of cleaned) {
    if (seen.has(ref)) continue;
    if (isPlaceStopRef(ref)) {
      const id = placeIdFromStopRef(ref);
      if (!id || !validPlaceIds.has(id)) continue;
    } else if (!getPilgrimageSite(ref)) {
      continue;
    }
    seen.add(ref);
    unique.push(ref);
  }

  return unique.length > 0 ? unique : null;
}

export async function saveUserPilgrimageRoute(input: {
  id?: string;
  title: string;
  stopSlugs: string[];
  baseRouteSlug?: string | null;
  notes?: string | null;
}): Promise<
  | { ok: true; id: string; shareId: string }
  | { ok: false; error: string }
> {
  try {
    const session = await requireSession();
    const title = input.title.trim();
    if (!title) return { ok: false, error: "Title is required" };

    const stopSlugs = await sanitizeStopSlugs(input.stopSlugs);
    if (!stopSlugs) {
      return { ok: false, error: "Add at least one known stop" };
    }

    if (input.id) {
      const updated = await updateUserPilgrimageRoute(
        session.user.id,
        input.id,
        {
          title,
          stopSlugs,
          baseRouteSlug: input.baseRouteSlug,
          notes: input.notes,
        },
      );
      if (!updated) return { ok: false, error: "Route not found" };
      return { ok: true, id: updated.id, shareId: updated.shareId };
    }

    const created = await createUserPilgrimageRoute(session.user.id, {
      title,
      stopSlugs,
      baseRouteSlug: input.baseRouteSlug,
      notes: input.notes,
    });
    return { ok: true, id: created.id, shareId: created.shareId };
  } catch {
    return { ok: false, error: "Sign in to save your route" };
  }
}

export async function removeUserPilgrimageRoute(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const session = await requireSession();
    const deleted = await deleteUserPilgrimageRoute(session.user.id, id);
    if (!deleted) return { ok: false, error: "Route not found" };
    return { ok: true };
  } catch {
    return { ok: false, error: "Sign in required" };
  }
}

export async function loadOwnedUserPilgrimageRoute(id: string) {
  const session = await requireSession().catch(() => null);
  if (!session) return null;
  return getUserPilgrimageRoute(session.user.id, id);
}

"use server";

import { requireSession } from "@/lib/auth-server";
import { getPilgrimageSite } from "@/data/pilgrimage";
import {
  createUserPilgrimageRoute,
  deleteUserPilgrimageRoute,
  getUserPilgrimageRoute,
  updateUserPilgrimageRoute,
} from "@/lib/data/user-pilgrimage-routes";

function sanitizeStopSlugs(stopSlugs: string[]): string[] | null {
  if (!Array.isArray(stopSlugs) || stopSlugs.length === 0) return null;
  const cleaned = stopSlugs
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && Boolean(getPilgrimageSite(s)));
  if (cleaned.length === 0) return null;
  // Preserve order; drop duplicates.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const slug of cleaned) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    unique.push(slug);
  }
  return unique;
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

    const stopSlugs = sanitizeStopSlugs(input.stopSlugs);
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

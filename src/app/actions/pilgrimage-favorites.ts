"use server";

import { getSession, requireSession } from "@/lib/auth-server";
import {
  addPilgrimageFavorite,
  listPilgrimageFavoriteKeys,
  removePilgrimageFavorite,
} from "@/lib/data/pilgrimage-favorites";
import {
  getPilgrimageRoute,
  getPilgrimageSite,
} from "@/data/pilgrimage";
import type { PilgrimageFavoriteKind } from "@/lib/pilgrimage-favorite-key";

function isValidKind(kind: string): kind is PilgrimageFavoriteKind {
  return kind === "site" || kind === "route";
}

function catalogExists(kind: PilgrimageFavoriteKind, slug: string): boolean {
  if (kind === "site") return Boolean(getPilgrimageSite(slug));
  return Boolean(getPilgrimageRoute(slug));
}

export async function getPilgrimageFavoriteKeys(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];
  return listPilgrimageFavoriteKeys(session.user.id);
}

export async function setPilgrimageFavorite(
  kind: PilgrimageFavoriteKind,
  slug: string,
  favorited: boolean,
): Promise<{ ok: true; favorited: boolean } | { ok: false; error: string }> {
  try {
    const session = await requireSession();
    if (!isValidKind(kind)) return { ok: false, error: "Invalid type" };
    const cleanSlug = slug.trim();
    if (!cleanSlug || !catalogExists(kind, cleanSlug)) {
      return { ok: false, error: "Unknown pilgrimage entry" };
    }

    if (favorited) {
      await addPilgrimageFavorite(session.user.id, kind, cleanSlug);
    } else {
      await removePilgrimageFavorite(session.user.id, kind, cleanSlug);
    }

    return { ok: true, favorited };
  } catch {
    return { ok: false, error: "Sign in to save pilgrimage routes" };
  }
}

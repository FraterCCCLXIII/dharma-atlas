"use server";

import { getSession, requireSession } from "@/lib/auth-server";
import {
  addPlaceFavorite,
  isPlaceFavorited,
  listFavoritePlaceIds,
  removePlaceFavorite,
} from "@/lib/data/place-favorites";

export async function getPlaceFavoriteStatus(placeId: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return isPlaceFavorited(session.user.id, placeId);
}

export async function getFavoritePlaceIds(): Promise<string[]> {
  const session = await getSession();
  if (!session) return [];
  return listFavoritePlaceIds(session.user.id);
}

export async function setPlaceFavorite(
  placeId: string,
  favorited: boolean,
): Promise<{ ok: true; favorited: boolean } | { ok: false; error: string }> {
  try {
    const session = await requireSession();
    const id = placeId.trim();
    if (!id) return { ok: false, error: "Invalid place" };

    if (favorited) {
      await addPlaceFavorite(session.user.id, id);
    } else {
      await removePlaceFavorite(session.user.id, id);
    }

    return { ok: true, favorited };
  } catch {
    return { ok: false, error: "Sign in to save places" };
  }
}

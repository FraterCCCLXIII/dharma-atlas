import "server-only";

import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth-server";
import { getPlaceById } from "@/lib/data/places";
import { canEditPlace } from "@/lib/place-access";
import type { Place } from "@/types/place";

/** Load a place the current user can manage, or 404. */
export async function requireManagedPlace(placeId: string): Promise<Place> {
  const session = await getSession();
  if (!session) notFound();

  const allowed = await canEditPlace(session.user.id, session.user.role, placeId);
  if (!allowed) notFound();

  const place = await getPlaceById(placeId, { includeDrafts: true });
  if (!place) notFound();

  return place;
}

import { and, asc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  pilgrimageRouteStops,
  pilgrimageRoutes,
  places,
} from "@/db/schema";
import { rowToPlace } from "@/lib/place-row";
import type { Place } from "@/types/place";

export type PlacePilgrimageRouteRef = {
  slug: string;
  name: string;
  region: string;
  tradition: string;
};

function isMissingPilgrimageSchema(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /is_pilgrimage_site|pilgrimage_slug|pilgrimage_routes|pilgrimage_route_stops/i.test(
      message,
    ) || /column .* does not exist|relation .* does not exist/i.test(message)
  );
}

/** Canonical routes that include this place as a stop. */
export async function getPilgrimageRoutesForPlace(
  placeId: string,
): Promise<PlacePilgrimageRouteRef[]> {
  try {
    return await db
      .select({
        slug: pilgrimageRoutes.slug,
        name: pilgrimageRoutes.name,
        region: pilgrimageRoutes.region,
        tradition: pilgrimageRoutes.tradition,
      })
      .from(pilgrimageRouteStops)
      .innerJoin(
        pilgrimageRoutes,
        eq(pilgrimageRouteStops.routeSlug, pilgrimageRoutes.slug),
      )
      .where(eq(pilgrimageRouteStops.placeId, placeId))
      .orderBy(asc(pilgrimageRoutes.name));
  } catch (error) {
    if (isMissingPilgrimageSchema(error)) return [];
    throw error;
  }
}

export async function getPlaceByPilgrimageSlug(
  pilgrimageSlug: string,
): Promise<Place | null> {
  try {
    const [row] = await db
      .select()
      .from(places)
      .where(
        and(eq(places.pilgrimageSlug, pilgrimageSlug), isNull(places.deletedAt)),
      )
      .limit(1);
    return row ? rowToPlace(row) : null;
  } catch (error) {
    // Pre-migration: schema code ships before 0029 is applied.
    if (isMissingPilgrimageSchema(error)) return null;
    throw error;
  }
}

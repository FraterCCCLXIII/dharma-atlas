import { inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { places } from "@/db/schema";
import {
  isPlaceStopRef,
  placeIdFromStopRef,
  resolveCatalogStop,
  routeStopFromPlace,
  type RouteStopPoint,
} from "@/lib/pilgrimage-stop-ref";

/** Resolve saved stop refs (catalog slugs or `place:{id}`) for display/maps. */
export async function resolveRouteStops(
  stopRefs: string[],
): Promise<RouteStopPoint[]> {
  const placeIds = stopRefs
    .map((ref) => placeIdFromStopRef(ref))
    .filter((id): id is string => Boolean(id));

  const placeById = new Map<string, PlaceStopDetailsRow>();
  if (placeIds.length > 0) {
    const rows = await db
      .select({
        id: places.id,
        name: places.name,
        lat: places.lat,
        lng: places.lng,
        address: places.address,
        photo: places.photo,
        slug: places.slug,
        pilgrimageSlug: places.pilgrimageSlug,
      })
      .from(places)
      .where(inArray(places.id, placeIds));
    for (const row of rows) {
      placeById.set(row.id, row);
    }
  }

  const resolved: RouteStopPoint[] = [];
  for (const ref of stopRefs) {
    if (isPlaceStopRef(ref)) {
      const id = placeIdFromStopRef(ref);
      const row = id ? placeById.get(id) : undefined;
      if (!row) continue;
      resolved.push(routeStopFromPlace(row));
      continue;
    }
    const catalog = resolveCatalogStop(ref);
    if (catalog) resolved.push(catalog);
  }
  return resolved;
}

type PlaceStopDetailsRow = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  photo: string | null;
  slug: string;
  pilgrimageSlug: string | null;
};

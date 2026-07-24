import type { MapBounds } from "@/lib/coords";
import type { LocationFilter } from "@/store/explore-store";
import type { PlaceType } from "@/types/place";

export type ExplorePlacesQueryInput = {
  query: string;
  traditions: string[];
  schools: string[];
  types: PlaceType[];
  faiths: string[];
  page: number;
  pageSize: number;
  /**
   * Map-bounds sync for the list. When on, viewport bounds win even if a
   * Near You / area locationFilter is still active (that filter only seeds the map).
   */
  mapBounds: MapBounds | null;
  locationFilter: LocationFilter | null;
  syncListToMap: boolean;
};

/** Build `/api/explore/places` query string matching map filter state. */
export function buildExplorePlacesSearchParams(
  input: ExplorePlacesQueryInput,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(input.page));
  params.set("pageSize", String(input.pageSize));
  if (input.query.trim()) params.set("q", input.query.trim());
  if (input.traditions.length) {
    params.set("traditions", input.traditions.join(","));
  }
  if (input.schools.length) params.set("schools", input.schools.join(","));
  if (input.types.length) params.set("types", input.types.join(","));
  if (input.faiths.length) params.set("faiths", input.faiths.join(","));

  if (input.syncListToMap && input.mapBounds) {
    const { south, north, west, east } = input.mapBounds;
    params.set("south", String(south));
    params.set("north", String(north));
    params.set("west", String(west));
    params.set("east", String(east));
  } else if (input.locationFilter) {
    const { bounds, lat, lng, matchTerms } = input.locationFilter;
    params.set("locSouth", String(bounds.south));
    params.set("locNorth", String(bounds.north));
    params.set("locWest", String(bounds.west));
    params.set("locEast", String(bounds.east));
    params.set("locLat", String(lat));
    params.set("locLng", String(lng));
    if (matchTerms?.length) params.set("locTerms", matchTerms.join(","));
  }

  return params;
}

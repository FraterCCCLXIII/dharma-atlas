import {
  appendExploreFilterParams,
  type ExploreFilterQueryInput,
} from "@/lib/explore-places-query";
import type { ExploreMapPin, PlaceMarker } from "@/types/place";

let markersCache: PlaceMarker[] | null = null;
let markersPromise: Promise<PlaceMarker[]> | null = null;

/**
 * Full PlaceMarker directory for home / all-browse featured.
 * Locations map should use {@link fetchExploreMapPins} instead.
 */
export function fetchExploreMarkers(): Promise<PlaceMarker[]> {
  if (markersCache) return Promise.resolve(markersCache);
  if (!markersPromise) {
    markersPromise = fetch("/api/explore/markers?full=1")
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Failed to load place markers (${res.status})`);
        }
        const data = (await res.json()) as { markers: PlaceMarker[] };
        markersCache = data.markers ?? [];
        return markersCache;
      })
      .catch((error) => {
        markersPromise = null;
        throw error;
      });
  }
  return markersPromise;
}

export function getCachedExploreMarkers(): PlaceMarker[] | null {
  return markersCache;
}

export type ExploreMapPinsResult = {
  markers: ExploreMapPin[];
  total: number;
};

/** Viewport + filter scoped map pins (Airbnb-style). */
export async function fetchExploreMapPins(
  input: ExploreFilterQueryInput,
  init?: RequestInit,
): Promise<ExploreMapPinsResult> {
  const params = new URLSearchParams();
  appendExploreFilterParams(params, input);
  const res = await fetch(`/api/explore/markers?${params.toString()}`, init);
  if (!res.ok) {
    throw new Error(`Failed to load map pins (${res.status})`);
  }
  const data = (await res.json()) as ExploreMapPinsResult;
  return {
    markers: data.markers ?? [],
    total: data.total ?? data.markers?.length ?? 0,
  };
}

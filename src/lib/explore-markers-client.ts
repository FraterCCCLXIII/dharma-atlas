import type { PlaceMarker } from "@/types/place";

let markersCache: PlaceMarker[] | null = null;
let markersPromise: Promise<PlaceMarker[]> | null = null;

/** Session-scoped fetch of slim explore markers (shared across list/map toggles). */
export function fetchExploreMarkers(): Promise<PlaceMarker[]> {
  if (markersCache) return Promise.resolve(markersCache);
  if (!markersPromise) {
    markersPromise = fetch("/api/explore/markers")
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

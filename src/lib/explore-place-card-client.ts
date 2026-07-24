import type { PlaceMarker } from "@/types/place";

const cardCache = new Map<string, PlaceMarker>();
const inflight = new Map<string, Promise<PlaceMarker | null>>();

/** Seed cache from list/strip rows so map popovers skip a network round-trip. */
export function primeExplorePlaceCard(place: PlaceMarker) {
  cardCache.set(place.id, place);
}

/** Lazy PlaceMarker for map popovers (name / photo / address). */
export function fetchExplorePlaceCard(id: string): Promise<PlaceMarker | null> {
  const cached = cardCache.get(id);
  if (cached) return Promise.resolve(cached);

  const existing = inflight.get(id);
  if (existing) return existing;

  const promise = fetch(`/api/explore/place-card?id=${encodeURIComponent(id)}`)
    .then(async (res) => {
      if (res.status === 404) return null;
      if (!res.ok) {
        throw new Error(`Failed to load place card (${res.status})`);
      }
      const data = (await res.json()) as { place: PlaceMarker };
      cardCache.set(id, data.place);
      return data.place;
    })
    .finally(() => {
      inflight.delete(id);
    });

  inflight.set(id, promise);
  return promise;
}

import type { Place } from "@/types/place";

export function getPlaceMapsUrls(place: Place) {
  return {
    search: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`,
    directions: `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`,
  };
}

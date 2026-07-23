import { parseLocationMode, placeShowsMapPin } from "@/lib/place-location";
import type { Place } from "@/types/place";

export function getPlaceMapsUrls(place: Place) {
  const mode = parseLocationMode(place.locationMode);
  const address = place.address?.trim();
  const query =
    mode === "area" && address
      ? encodeURIComponent(address)
      : placeShowsMapPin(place)
        ? `${place.lat},${place.lng}`
        : address
          ? encodeURIComponent(address)
          : "";

  return {
    search: query
      ? `https://www.google.com/maps/search/?api=1&query=${query}`
      : null,
    directions:
      mode === "venue" && placeShowsMapPin(place)
        ? `https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`
        : null,
  };
}

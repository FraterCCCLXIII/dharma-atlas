import { hasValidCoords } from "@/lib/coords";
import type { CoordPrecision, LocationMode, Place, PlaceMarker } from "@/types/place";

export const LOCATION_MODES = ["venue", "area", "online"] as const;

export const LOCATION_MODE_LABELS: Record<LocationMode, string> = {
  venue: "Fixed venue",
  area: "Area only",
  online: "Online only",
};

export const LOCATION_MODE_HINTS: Record<LocationMode, string> = {
  venue: "Street address and map pin for visitors.",
  area: "Show a city or region only — no street address (home sits, regional groups).",
  online: "No map pin. Emphasize website and online practice.",
};

export function parseLocationMode(value: unknown): LocationMode {
  if (value === "area" || value === "online" || value === "venue") return value;
  return "venue";
}

/** Default map precision stored alongside a location mode. */
export function coordPrecisionForMode(mode: LocationMode): CoordPrecision {
  switch (mode) {
    case "venue":
      return "address";
    case "area":
      return "city";
    case "online":
      return "unknown";
  }
}

export function placeShowsMapPin(
  place: Pick<Place | PlaceMarker, "locationMode" | "lat" | "lng">,
): boolean {
  const mode = parseLocationMode(place.locationMode);
  if (mode === "online") return false;
  return hasValidCoords(place.lat, place.lng);
}

export function placeShowsDirections(
  place: Pick<Place, "locationMode" | "lat" | "lng">,
): boolean {
  return parseLocationMode(place.locationMode) === "venue" && placeShowsMapPin(place);
}

/** Public address line — never falls back to raw coordinates for area/online. */
export function placeLocationLabel(
  place: Pick<Place | PlaceMarker, "locationMode" | "address" | "lat" | "lng">,
): string {
  const mode = parseLocationMode(place.locationMode);
  const address = place.address?.trim();

  if (mode === "online") {
    return address ? `Online · serves ${address}` : "Online only";
  }
  if (mode === "area") {
    return address || "Area not listed";
  }
  if (address) return address;
  if (hasValidCoords(place.lat, place.lng)) {
    return `${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}`;
  }
  return "Address not listed";
}

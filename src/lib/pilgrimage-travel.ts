import type { PilgrimageSite } from "@/data/pilgrimage";

export type TravelMode = "all" | "flight" | "train" | "bus" | "drive" | "walk";

/** Rome2Rio door-to-door search between two lat/lng points. */
export function rome2RioUrl(
  from: Pick<PilgrimageSite, "lat" | "lng" | "name">,
  to: Pick<PilgrimageSite, "lat" | "lng" | "name">,
): string {
  const o = `${from.lat},${from.lng}`;
  const d = `${to.lat},${to.lng}`;
  return `https://www.rome2rio.com/map/${encodeURIComponent(o)}/${encodeURIComponent(d)}`;
}

/** Google Maps directions; optional travelmode. */
export function googleMapsDirectionsUrl(
  from: Pick<PilgrimageSite, "lat" | "lng">,
  to: Pick<PilgrimageSite, "lat" | "lng">,
  mode: "drive" | "walk" = "drive",
): string {
  const travelmode = mode === "walk" ? "walking" : "driving";
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${from.lat},${from.lng}` +
    `&destination=${to.lat},${to.lng}` +
    `&travelmode=${travelmode}`
  );
}

export type LegTravelLinks = {
  rome2Rio: string;
  googleMapsDrive: string;
  googleMapsWalk: string;
};

export function getLegTravelLinks(
  from: PilgrimageSite,
  to: PilgrimageSite,
): LegTravelLinks {
  return {
    rome2Rio: rome2RioUrl(from, to),
    googleMapsDrive: googleMapsDirectionsUrl(from, to, "drive"),
    googleMapsWalk: googleMapsDirectionsUrl(from, to, "walk"),
  };
}

/** Haversine distance in km — for UI hints, not navigation. */
export function haversineKm(
  a: Pick<PilgrimageSite, "lat" | "lng">,
  b: Pick<PilgrimageSite, "lat" | "lng">,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(0)} km`;
  return `${Math.round(km)} km`;
}

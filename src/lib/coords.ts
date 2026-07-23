export function isValidCoord(lat: unknown, lng: unknown): boolean {
  const la = Number(lat);
  const ln = Number(lng);
  return (
    Number.isFinite(la) &&
    Number.isFinite(ln) &&
    Math.abs(la) <= 90 &&
    Math.abs(ln) <= 180
  );
}

/** True for real map pins; treats (0, 0) as missing. */
export function hasValidCoords(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  return true;
}

export function toLatLng(lat: unknown, lng: unknown): [number, number] | null {
  const la = Number(lat);
  const ln = Number(lng);
  return isValidCoord(la, ln) ? [la, ln] : null;
}

/**
 * How many world copies to paint on each side of the primary (−180…180) map.
 * Leaflet tiles wrap indefinitely; markers do not, so we clone at ±360° steps.
 */
export const WORLD_WRAP_SIDE_COUNT = 3;

/** Longitude offsets: …, -720, -360, 0, 360, 720, … */
export const WORLD_LNG_OFFSETS: readonly number[] = Array.from(
  { length: WORLD_WRAP_SIDE_COUNT * 2 + 1 },
  (_, i) => (i - WORLD_WRAP_SIDE_COUNT) * 360,
);

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/** ~0.15° ≈ 10–16 mi; used for point geocodes without a bounding box. */
export const DEFAULT_POINT_DELTA = 0.15;

/** Wider radius for “Near you” so metro-area places stay in view. */
export const NEAR_YOU_POINT_DELTA = 0.4;

export function boundsFromPoint(
  lat: number,
  lng: number,
  delta = DEFAULT_POINT_DELTA,
): MapBounds {
  return {
    north: Math.min(90, lat + delta),
    south: Math.max(-90, lat - delta),
    east: Math.min(180, lng + delta),
    west: Math.max(-180, lng - delta),
  };
}

export function isPlaceInMapBounds(
  lat: unknown,
  lng: unknown,
  bounds: MapBounds,
): boolean {
  if (!isValidCoord(lat, lng)) return false;

  const la = Number(lat);
  const ln = Number(lng);

  if (la < bounds.south || la > bounds.north) return false;

  if (bounds.west <= bounds.east) {
    return ln >= bounds.west && ln <= bounds.east;
  }

  return ln >= bounds.west || ln <= bounds.east;
}

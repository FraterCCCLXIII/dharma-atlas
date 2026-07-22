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

export function toLatLng(lat: unknown, lng: unknown): [number, number] | null {
  const la = Number(lat);
  const ln = Number(lng);
  return isValidCoord(la, ln) ? [la, ln] : null;
}

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

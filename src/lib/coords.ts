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
 * Max world copies on each side of the viewport center.
 * Leaflet tiles wrap indefinitely; markers do not, so we clone at ±360° steps.
 */
export const WORLD_WRAP_SIDE_COUNT = 3;

/**
 * Static full set around the primary meridian (legacy / max span).
 * Prefer {@link worldLngOffsetsForBounds} so maps only clone worlds in view.
 */
export const WORLD_LNG_OFFSETS: readonly number[] = Array.from(
  { length: WORLD_WRAP_SIDE_COUNT * 2 + 1 },
  (_, i) => (i - WORLD_WRAP_SIDE_COUNT) * 360,
);

/**
 * Longitude offsets whose world copies overlap the current viewport.
 *
 * Place lngs live in −180…180; a copy at `lng + k·360` covers
 * `[k·360 − 180, k·360 + 180]`. We only return the `k·360` values that
 * intersect the padded bounds so markers are not cloned until the user
 * pans toward (or into) that world.
 */
export function worldLngOffsetsForBounds(
  west: number,
  east: number,
  options?: { padDeg?: number; maxSideCount?: number },
): number[] {
  if (!Number.isFinite(west) || !Number.isFinite(east) || east < west) {
    return [0];
  }

  // Keep pad tight — wide pads clone whole pin sets at ±360° and thrash clustering.
  const padDeg = options?.padDeg ?? 15;
  const maxSide = options?.maxSideCount ?? WORLD_WRAP_SIDE_COUNT;
  const lo = west - padDeg;
  const hi = east + padDeg;

  // World k overlaps [lo, hi] iff k·360 − 180 < hi and k·360 + 180 > lo.
  let kStart = Math.ceil((lo - 180) / 360 - 1e-9);
  let kEnd = Math.floor((hi + 180) / 360 + 1e-9);

  const centerK = Math.round((west + east) / 2 / 360);
  kStart = Math.max(kStart, centerK - maxSide);
  kEnd = Math.min(kEnd, centerK + maxSide);

  if (kEnd < kStart) return [centerK * 360];

  const offsets: number[] = [];
  for (let k = kStart; k <= kEnd; k++) {
    offsets.push(k * 360);
  }
  return offsets;
}

export function sameLngOffsets(
  a: readonly number[],
  b: readonly number[],
): boolean {
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/**
 * Expand bounds by a fraction of each axis span so map pin fetches cover a
 * cushion around the viewport (avoids refetch/rebuild on every small pan).
 */
export function expandMapBounds(bounds: MapBounds, factor = 0.75): MapBounds {
  const latSpan = Math.max(0.01, bounds.north - bounds.south);
  const latPad = latSpan * factor;
  const lngSpan = bounds.east - bounds.west;
  // Antimeridian / unwrapped viewports: don't try to pad split ranges.
  if (!(lngSpan > 0) || !Number.isFinite(lngSpan)) {
    return {
      south: Math.max(-90, bounds.south - latPad),
      north: Math.min(90, bounds.north + latPad),
      west: bounds.west,
      east: bounds.east,
    };
  }
  const lngPad = Math.max(0.01, lngSpan) * factor;
  return {
    south: Math.max(-90, bounds.south - latPad),
    north: Math.min(90, bounds.north + latPad),
    west: bounds.west - lngPad,
    east: bounds.east + lngPad,
  };
}

/** True when `inner` is fully inside `outer` (simple non-wrapping ranges). */
export function mapBoundsContains(outer: MapBounds, inner: MapBounds): boolean {
  if (inner.south < outer.south || inner.north > outer.north) return false;
  if (outer.west <= outer.east && inner.west <= inner.east) {
    return inner.west >= outer.west && inner.east <= outer.east;
  }
  return false;
}

/** Approximate geographic area of a bounds box (deg²). */
export function mapBoundsArea(bounds: MapBounds): number {
  const latSpan = Math.max(0, bounds.north - bounds.south);
  const lngSpan = bounds.east - bounds.west;
  if (!(lngSpan > 0) || !Number.isFinite(lngSpan)) return latSpan;
  return latSpan * lngSpan;
}

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

  const { west, east } = bounds;

  if (west <= east) {
    // Place lng is stored in −180…180; Leaflet viewports can be unwrapped
    // (e.g. 200…300). Match if any world copy falls inside the viewport.
    const center = (west + east) / 2;
    const base = Math.round((center - ln) / 360) * 360;
    for (const delta of [base - 360, base, base + 360]) {
      const wrapped = ln + delta;
      if (wrapped >= west && wrapped <= east) return true;
    }
    return false;
  }

  // Antimeridian-style split already expressed in primary coords.
  return ln >= west || ln <= east;
}

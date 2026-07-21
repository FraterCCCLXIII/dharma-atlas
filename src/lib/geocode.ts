import "server-only";

import type { MapBounds } from "@/lib/coords";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "DharmaAtlas/1.0 (contact@dharmaatlas.com)";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const DEFAULT_POINT_DELTA = 0.15;

let lastRequestAt = 0;

export interface GeocodeResult {
  lat: number;
  lng: number;
}

export interface LocationSearchResult {
  label: string;
  lat: number;
  lng: number;
  bounds: MapBounds;
  type: string;
  className: string;
}

type NominatimHit = {
  lat: string;
  lon: string;
  display_name: string;
  class?: string;
  type?: string;
  boundingbox?: [string, string, string, string];
};

type CacheEntry = {
  results: LocationSearchResult[];
  expiresAt: number;
};

const searchCache = new Map<string, CacheEntry>();

const PREFERRED_TYPES = new Set([
  "city",
  "town",
  "village",
  "suburb",
  "hamlet",
  "neighbourhood",
  "neighborhood",
  "borough",
  "municipality",
  "county",
  "state",
  "province",
  "region",
  "country",
  "administrative",
]);

export function hasValidCoords(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return false;
  return true;
}

async function throttle() {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
  }
  lastRequestAt = Date.now();
}

function boundsFromPoint(
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

function boundsFromNominatim(
  hit: NominatimHit,
  lat: number,
  lng: number,
): MapBounds {
  const box = hit.boundingbox;
  if (!box || box.length !== 4) return boundsFromPoint(lat, lng);

  const south = Number(box[0]);
  const north = Number(box[1]);
  const west = Number(box[2]);
  const east = Number(box[3]);

  if (
    !Number.isFinite(south) ||
    !Number.isFinite(north) ||
    !Number.isFinite(west) ||
    !Number.isFinite(east)
  ) {
    return boundsFromPoint(lat, lng);
  }

  return { north, south, east, west };
}

function shortenLabel(displayName: string): string {
  const parts = displayName.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 3) return displayName;
  return parts.slice(0, 3).join(", ");
}

function scoreLocation(result: Pick<LocationSearchResult, "type" | "className">): number {
  let score = 0;
  if (PREFERRED_TYPES.has(result.type)) score += 10;
  if (result.className === "place") score += 5;
  if (result.className === "boundary") score += 3;
  if (result.type === "city" || result.type === "town") score += 4;
  if (result.type === "administrative") score += 2;
  return score;
}

function toLocationResult(hit: NominatimHit): LocationSearchResult | null {
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!hasValidCoords(lat, lng)) return null;

  return {
    label: shortenLabel(hit.display_name),
    lat,
    lng,
    bounds: boundsFromNominatim(hit, lat, lng),
    type: hit.type ?? "",
    className: hit.class ?? "",
  };
}

function getCached(query: string): LocationSearchResult[] | null {
  const entry = searchCache.get(query);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    searchCache.delete(query);
    return null;
  }
  return entry.results;
}

function setCache(query: string, results: LocationSearchResult[]) {
  searchCache.set(query, {
    results,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export async function searchLocations(
  query: string,
  limit = 5,
): Promise<LocationSearchResult[]> {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 3) return [];

  const cached = getCached(normalized);
  if (cached) return cached.slice(0, limit);

  await throttle();

  const params = new URLSearchParams({
    q: query.trim(),
    format: "json",
    addressdetails: "1",
    limit: String(Math.min(10, Math.max(limit, 5))),
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return [];

  const hits = (await response.json()) as NominatimHit[];
  const results = hits
    .map(toLocationResult)
    .filter((result): result is LocationSearchResult => result !== null)
    .sort((a, b) => scoreLocation(b) - scoreLocation(a));

  // Prefer geographic localities when present; fall back to all hits.
  const preferred = results.filter(
    (result) =>
      PREFERRED_TYPES.has(result.type) ||
      result.className === "place" ||
      result.className === "boundary",
  );
  const ranked = (preferred.length > 0 ? preferred : results).slice(0, 5);

  setCache(normalized, ranked);
  return ranked.slice(0, limit);
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const results = await searchLocations(query, 1);
  const hit = results[0];
  if (!hit) return null;
  return { lat: hit.lat, lng: hit.lng };
}

export function mergeQualityFlag(
  flags: string[],
  flag: string,
): string[] {
  return flags.includes(flag) ? flags : [...flags, flag];
}

export function withoutQualityFlag(flags: string[], flag: string): string[] {
  return flags.filter((entry) => entry !== flag);
}

import "server-only";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "DharmaAtlas/1.0 (contact@dharmaatlas.com)";

let lastRequestAt = 0;

export interface GeocodeResult {
  lat: number;
  lng: number;
}

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

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const normalized = query.trim();
  if (!normalized) return null;

  await throttle();

  const params = new URLSearchParams({
    q: normalized,
    format: "json",
    limit: "1",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "User-Agent": USER_AGENT },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return null;

  const results = (await response.json()) as Array<{ lat: string; lon: string }>;
  const hit = results[0];
  if (!hit) return null;

  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!hasValidCoords(lat, lng)) return null;

  return { lat, lng };
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

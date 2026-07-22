import {
  boundsFromPoint,
  isPlaceInMapBounds,
  isValidCoord,
  NEAR_YOU_POINT_DELTA,
  type MapBounds,
} from "@/lib/coords";

export const NEAR_YOU_LABEL = "you";

const NEAR_BOUNDS_STORAGE_KEY = "da-near-you-bounds";

export type ResolvedUserLocation = {
  lat: number;
  lng: number;
  bounds: MapBounds;
  source: "browser" | "ip";
};

export function isLocationNearYou(
  lat: unknown,
  lng: unknown,
  nearBounds: MapBounds | null | undefined,
): boolean {
  if (!nearBounds) return false;
  return isPlaceInMapBounds(lat, lng, nearBounds);
}

function isMapBounds(value: unknown): value is MapBounds {
  if (!value || typeof value !== "object") return false;
  const bounds = value as MapBounds;
  return (
    Number.isFinite(bounds.north) &&
    Number.isFinite(bounds.south) &&
    Number.isFinite(bounds.east) &&
    Number.isFinite(bounds.west)
  );
}

export function loadStoredNearBounds(): MapBounds | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(NEAR_BOUNDS_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isMapBounds(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function storeNearBounds(bounds: MapBounds): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(NEAR_BOUNDS_STORAGE_KEY, JSON.stringify(bounds));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function getBrowserLocation(
  timeoutMs = 8_000,
): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        resolve(isValidCoord(lat, lng) ? { lat, lng } : null);
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: timeoutMs,
        maximumAge: 5 * 60 * 1000,
      },
    );
  });
}

async function geolocationPermissionState(): Promise<PermissionState | "unknown"> {
  if (typeof navigator === "undefined" || !navigator.permissions?.query) {
    return "unknown";
  }
  try {
    const status = await navigator.permissions.query({
      name: "geolocation" as PermissionName,
    });
    return status.state;
  } catch {
    return "unknown";
  }
}

async function getIpLocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch("/api/geolocate");
    if (!response.ok) return null;
    const data = (await response.json()) as {
      lat?: number;
      lng?: number;
    };
    if (!isValidCoord(data.lat, data.lng)) return null;
    return { lat: Number(data.lat), lng: Number(data.lng) };
  } catch {
    return null;
  }
}

export type NearBoundsForLabeling = {
  bounds: MapBounds;
  source: "browser" | "ip";
};

/**
 * Location for “Near you” badges only — does not activate the map filter.
 * Uses previously granted GPS when available, otherwise IP.
 */
export async function resolveNearBoundsForLabeling(): Promise<NearBoundsForLabeling | null> {
  const permission = await geolocationPermissionState();
  if (permission === "granted") {
    const browser = await getBrowserLocation(4_000);
    if (browser) {
      return {
        bounds: boundsFromPoint(browser.lat, browser.lng, NEAR_YOU_POINT_DELTA),
        source: "browser",
      };
    }
  }

  const ip = await getIpLocation();
  if (!ip) return null;
  return {
    bounds: boundsFromPoint(ip.lat, ip.lng, NEAR_YOU_POINT_DELTA),
    source: "ip",
  };
}

/** Prefer browser GPS; fall back to IP-based approximation. */
export async function resolveUserLocation(): Promise<ResolvedUserLocation | null> {
  const browser = await getBrowserLocation();
  if (browser) {
    return {
      ...browser,
      bounds: boundsFromPoint(browser.lat, browser.lng, NEAR_YOU_POINT_DELTA),
      source: "browser",
    };
  }

  const ip = await getIpLocation();
  if (!ip) return null;

  return {
    ...ip,
    bounds: boundsFromPoint(ip.lat, ip.lng, NEAR_YOU_POINT_DELTA),
    source: "ip",
  };
}

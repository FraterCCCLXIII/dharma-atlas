import type { CoordPrecision, PlaceOpeningHours } from "@/types/place";

export const BAD_WEBSITE_HOSTS = new Set([
  "mapof.it",
  "facebook.com",
  "twitter.com",
  "x.com",
  "linkedin.com",
  "bit.ly",
  "goo.gl",
]);

export const COORD_PRECISION_RANK: Record<CoordPrecision, number> = {
  pin: 5,
  address: 4,
  city: 3,
  region: 2,
  unknown: 1,
};

/** Known country/region centroid clusters from bad batch geocoding. */
export const SUSPICIOUS_COORD_CLUSTERS: Array<{ lat: number; lng: number; label: string }> = [
  { lat: 51.16, lng: 10.45, label: "Germany centroid" },
  { lat: 36.7, lng: -118.76, label: "US California centroid" },
  { lat: 22.35, lng: 78.67, label: "India centroid" },
  { lat: 46.6, lng: 1.89, label: "France centroid" },
  { lat: 7.56, lng: 80.71, label: "Sri Lanka centroid" },
  { lat: 24.48, lng: 90.29, label: "Bangladesh centroid" },
  { lat: 4.57, lng: 102.27, label: "Malaysia centroid" },
  { lat: 61.07, lng: -107.99, label: "Canada centroid" },
];

export function normalizeWebsiteHost(url: string | null | undefined): string | null {
  if (!url) return null;
  let normalized = url.trim();
  if (!normalized) return null;
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }
  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const path = parsed.pathname.replace(/\/$/, "");
    return path && path !== "/" ? `${host}${path}` : host;
  } catch {
    return null;
  }
}

export function isBadWebsite(url: string | null | undefined): boolean {
  const host = normalizeWebsiteHost(url);
  if (!host) return false;
  const hostname = host.split("/")[0];
  return BAD_WEBSITE_HOSTS.has(hostname) || hostname.endsWith(".mapof.it");
}

export function inferCoordPrecisionFromFolder(folder: string): CoordPrecision {
  if (!folder) return "unknown";
  if (folder.startsWith("BuddhaNet")) return "region";
  if (folder.startsWith("Goenka Vipassana")) return "city";
  if (
    folder === "Tibetan" ||
    folder === "Zen, Chan, Son, & Thien," ||
    folder.includes("Temple") ||
    folder.includes("Insight")
  ) {
    return "pin";
  }
  return "unknown";
}

export function isSuspiciousCoord(lat: number, lng: number, tolerance = 0.15): boolean {
  return SUSPICIOUS_COORD_CLUSTERS.some(
    (cluster) =>
      Math.abs(lat - cluster.lat) < tolerance && Math.abs(lng - cluster.lng) < tolerance,
  );
}

export function pickHigherPrecision(
  a: CoordPrecision,
  b: CoordPrecision,
): CoordPrecision {
  return COORD_PRECISION_RANK[a] >= COORD_PRECISION_RANK[b] ? a : b;
}

export interface MergeablePlaceFields {
  name?: string;
  lat?: number;
  lng?: number;
  tradition?: string;
  faith?: string;
  type?: string;
  folder?: string;
  address?: string;
  phone?: string | null;
  website?: string | null;
  description?: string | null;
  descriptionSource?: string | null;
  coordPrecision?: CoordPrecision;
  dataSource?: string | null;
  verifiedFields?: string[];
  qualityFlags?: string[];
  photo?: string | null;
  photoSource?: string | null;
  googlePlaceId?: string | null;
  googleMapsUri?: string | null;
  openingHours?: PlaceOpeningHours | null;
  googleRating?: number | null;
  googleRatingCount?: number | null;
  businessStatus?: string | null;
  googlePrimaryType?: string | null;
  schools?: string[];
}

export function mergePlaceFields(
  existing: MergeablePlaceFields,
  incoming: MergeablePlaceFields,
  options?: { forceFields?: string[] },
): MergeablePlaceFields {
  const verified = new Set(existing.verifiedFields ?? []);
  const force = new Set(options?.forceFields ?? []);
  const result: MergeablePlaceFields = { ...existing };

  function canOverwrite(field: string, incomingValue: unknown): boolean {
    if (incomingValue === undefined || incomingValue === null || incomingValue === "") return false;
    if (force.has(field)) return true;
    return !verified.has(field);
  }

  if (canOverwrite("name", incoming.name) && incoming.name) result.name = incoming.name;
  if (canOverwrite("tradition", incoming.tradition) && incoming.tradition) {
    result.tradition = incoming.tradition;
  }
  if (canOverwrite("faith", incoming.faith) && incoming.faith) result.faith = incoming.faith;
  if (canOverwrite("type", incoming.type) && incoming.type) result.type = incoming.type;
  if (canOverwrite("folder", incoming.folder) && incoming.folder) result.folder = incoming.folder;
  if (canOverwrite("dataSource", incoming.dataSource) && incoming.dataSource) {
    result.dataSource = incoming.dataSource;
  }

  if (canOverwrite("address", incoming.address) && incoming.address) {
    result.address = incoming.address;
  }

  if (canOverwrite("phone", incoming.phone) && incoming.phone) {
    result.phone = incoming.phone;
  }

  if (
    canOverwrite("website", incoming.website) &&
    incoming.website &&
    !isBadWebsite(incoming.website)
  ) {
    result.website = incoming.website;
  } else if (isBadWebsite(result.website)) {
    result.website = null;
  }

  if (canOverwrite("description", incoming.description) && incoming.description) {
    result.description = incoming.description;
    if (incoming.descriptionSource) result.descriptionSource = incoming.descriptionSource;
  }

  if (canOverwrite("photo", incoming.photo) && incoming.photo) {
    result.photo = incoming.photo;
    if (incoming.photoSource) result.photoSource = incoming.photoSource;
  }

  const existingPrecision = result.coordPrecision ?? "unknown";
  const incomingPrecision = incoming.coordPrecision ?? "unknown";
  if (canOverwrite("coords", incoming.lat) && incoming.lat != null && incoming.lng != null) {
    const better = pickHigherPrecision(existingPrecision, incomingPrecision);
    if (better !== existingPrecision || force.has("coords")) {
      result.lat = incoming.lat;
      result.lng = incoming.lng;
      result.coordPrecision = better;
    }
  } else if (incoming.coordPrecision) {
    result.coordPrecision = pickHigherPrecision(existingPrecision, incomingPrecision);
  }

  if (incoming.schools?.length && canOverwrite("schools", incoming.schools)) {
    result.schools = incoming.schools;
  }

  if (canOverwrite("googlePlaceId", incoming.googlePlaceId) && incoming.googlePlaceId) {
    result.googlePlaceId = incoming.googlePlaceId;
  }
  if (canOverwrite("googleMapsUri", incoming.googleMapsUri) && incoming.googleMapsUri) {
    result.googleMapsUri = incoming.googleMapsUri;
  }
  if (canOverwrite("openingHours", incoming.openingHours) && incoming.openingHours) {
    result.openingHours = incoming.openingHours;
  }
  if (canOverwrite("googleRating", incoming.googleRating) && incoming.googleRating != null) {
    result.googleRating = incoming.googleRating;
  }
  if (
    canOverwrite("googleRatingCount", incoming.googleRatingCount) &&
    incoming.googleRatingCount != null
  ) {
    result.googleRatingCount = incoming.googleRatingCount;
  }
  if (canOverwrite("businessStatus", incoming.businessStatus) && incoming.businessStatus) {
    result.businessStatus = incoming.businessStatus;
  }
  if (canOverwrite("googlePrimaryType", incoming.googlePrimaryType) && incoming.googlePrimaryType) {
    result.googlePrimaryType = incoming.googlePrimaryType;
  }

  const flags = new Set(result.qualityFlags ?? []);
  if (isBadWebsite(result.website)) flags.add("bad_website");
  if (result.lat != null && result.lng != null && isSuspiciousCoord(result.lat, result.lng)) {
    flags.add("stacked_coords");
  }
  if (result.description && !verified.has("description")) {
    flags.add("unverified_description");
  }
  result.qualityFlags = [...flags];

  return result;
}

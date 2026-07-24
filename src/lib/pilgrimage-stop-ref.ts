import {
  getPilgrimageImage,
  getPilgrimageSite,
  type PilgrimageSite,
} from "@/data/pilgrimage";

const PLACE_PREFIX = "place:";

export type RouteStopPoint = {
  key: string;
  name: string;
  lat: number;
  lng: number;
  /** Address / locality line for list display. */
  detail: string;
  image?: string;
  href?: string;
};

export type PlaceStopDetails = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  photo?: string | null;
  slug?: string | null;
  pilgrimageSlug?: string | null;
};

export function placeStopRef(placeId: string): string {
  return `${PLACE_PREFIX}${placeId}`;
}

export function isPlaceStopRef(ref: string): boolean {
  return ref.startsWith(PLACE_PREFIX) && ref.length > PLACE_PREFIX.length;
}

export function placeIdFromStopRef(ref: string): string | null {
  if (!isPlaceStopRef(ref)) return null;
  return ref.slice(PLACE_PREFIX.length);
}

/** Prefer catalog slug when the place is a seeded pilgrimage site. */
export function stopRefForPlace(place: {
  id: string;
  pilgrimageSlug?: string | null;
}): string {
  const pilgrimageSlug = place.pilgrimageSlug?.trim();
  if (pilgrimageSlug && getPilgrimageSite(pilgrimageSlug)) {
    return pilgrimageSlug;
  }
  return placeStopRef(place.id);
}

export function resolveCatalogStop(ref: string): RouteStopPoint | null {
  const site = getPilgrimageSite(ref);
  if (!site) return null;
  return routeStopFromSite(site);
}

export function routeStopFromSite(site: PilgrimageSite): RouteStopPoint {
  return {
    key: site.slug,
    name: site.name,
    lat: site.lat,
    lng: site.lng,
    detail: site.country,
    image: getPilgrimageImage(site.slug),
    href: `/place/${site.slug}`,
  };
}

export function routeStopFromPlace(place: PlaceStopDetails): RouteStopPoint {
  return {
    key: placeStopRef(place.id),
    name: place.name,
    lat: place.lat,
    lng: place.lng,
    detail: place.address,
    image: place.photo ?? undefined,
    href: place.slug ? `/place/${place.slug}` : `/place/${place.id}`,
  };
}

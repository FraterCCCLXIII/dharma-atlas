import type { EntityFilter } from "@/store/explore-store";

export const PEOPLE_LIST_PATH = "/people";

export function personProfilePath(slug: string): string {
  return `/person/${slug}`;
}

export const PLACES_LIST_PATH = "/places";
export const BOOKS_LIST_PATH = "/books";
export const TRADITIONS_LIST_PATH = "/traditions";
export const PILGRIMAGE_LIST_PATH = "/pilgrimage";

export function traditionProfilePath(slug: string): string {
  return `/traditions/${slug}`;
}

/** Public place profile URL. Prefer slug; id still resolves via redirect. */
export function placeProfilePath(place: { slug?: string | null; id: string }): string {
  return `/place/${place.slug || place.id}`;
}

const EXPLORE_PATHS: Record<EntityFilter, string> = {
  all: "/",
  locations: PLACES_LIST_PATH,
  people: PEOPLE_LIST_PATH,
};

export function pathFromEntityFilter(filter: EntityFilter): string {
  return EXPLORE_PATHS[filter];
}

export function entityFilterFromPath(pathname: string): EntityFilter {
  if (pathname === PLACES_LIST_PATH || pathname.startsWith("/place/")) {
    return "locations";
  }
  if (
    pathname === PEOPLE_LIST_PATH ||
    pathname.startsWith(`${PEOPLE_LIST_PATH}/`) ||
    pathname.startsWith("/person/")
  ) {
    return "people";
  }
  return "all";
}

export function isExplorePath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/all" ||
    pathname === PLACES_LIST_PATH ||
    pathname === PEOPLE_LIST_PATH ||
    pathname === BOOKS_LIST_PATH ||
    pathname.startsWith(`${BOOKS_LIST_PATH}/`) ||
    pathname === PILGRIMAGE_LIST_PATH ||
    pathname.startsWith(`${PILGRIMAGE_LIST_PATH}/`)
  );
}

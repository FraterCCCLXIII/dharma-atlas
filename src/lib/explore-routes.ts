import type { EntityFilter } from "@/store/explore-store";

export const PEOPLE_LIST_PATH = "/people";

export function personProfilePath(slug: string): string {
  return `/person/${slug}`;
}

export const PLACES_LIST_PATH = "/places";

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
    pathname === PEOPLE_LIST_PATH
  );
}

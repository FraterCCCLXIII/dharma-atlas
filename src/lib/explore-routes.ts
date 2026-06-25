import type { EntityFilter } from "@/store/explore-store";

const EXPLORE_PATHS: Record<EntityFilter, string> = {
  all: "/",
  locations: "/locations",
  people: "/teachers",
};

export function pathFromEntityFilter(filter: EntityFilter): string {
  return EXPLORE_PATHS[filter];
}

export function entityFilterFromPath(pathname: string): EntityFilter {
  if (pathname === "/locations" || pathname.startsWith("/place/")) {
    return "locations";
  }
  if (
    pathname === "/teachers" ||
    pathname.startsWith("/teachers/") ||
    pathname.startsWith("/teacher/")
  ) {
    return "people";
  }
  return "all";
}

export function isExplorePath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/all" ||
    pathname === "/locations" ||
    pathname === "/teachers"
  );
}

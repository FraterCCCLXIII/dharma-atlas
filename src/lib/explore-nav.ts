import {
  BookOpen,
  CirclesThree,
  MapPin,
  MapTrifold,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import {
  BOOKS_LIST_PATH,
  LINEAGES_LIST_PATH,
  PILGRIMAGE_LIST_PATH,
} from "@/lib/explore-routes";
import { SHOW_PILGRIMAGE } from "@/lib/feature-flags";

export type ExploreNavLink = {
  href: string;
  label: string;
  /** Short label for the mobile tab bar. */
  shortLabel?: string;
  icon: Icon;
  comingSoon?: boolean;
  isActive: (pathname: string) => boolean;
};

/** Primary explore destinations — top rail (md+) and mobile footer tabs. */
export const EXPLORE_NAV_LINKS: ExploreNavLink[] = [
  {
    href: "/places",
    label: "Places",
    shortLabel: "Places",
    icon: MapPin,
    isActive: (pathname) =>
      pathname === "/places" || pathname.startsWith("/place/"),
  },
  {
    href: "/people",
    label: "People",
    shortLabel: "People",
    icon: UsersThree,
    isActive: (pathname) =>
      pathname === "/people" || pathname.startsWith("/person/"),
  },
  ...(SHOW_PILGRIMAGE
    ? [
        {
          href: PILGRIMAGE_LIST_PATH,
          label: "Pilgrimage",
          shortLabel: "Paths",
          icon: MapTrifold,
          isActive: (pathname: string) =>
            pathname === PILGRIMAGE_LIST_PATH ||
            pathname.startsWith(`${PILGRIMAGE_LIST_PATH}/`),
        },
      ]
    : []),
  {
    href: LINEAGES_LIST_PATH,
    label: "Lineages",
    shortLabel: "Lines",
    icon: CirclesThree,
    comingSoon: true,
    isActive: (pathname) =>
      pathname === LINEAGES_LIST_PATH ||
      pathname.startsWith(`${LINEAGES_LIST_PATH}/`),
  },
  {
    href: BOOKS_LIST_PATH,
    label: "Books",
    shortLabel: "Books",
    icon: BookOpen,
    comingSoon: true,
    isActive: (pathname) =>
      pathname === BOOKS_LIST_PATH ||
      pathname.startsWith(`${BOOKS_LIST_PATH}/`),
  },
];

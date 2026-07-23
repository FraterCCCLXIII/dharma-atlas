"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  PEOPLE_LIST_PATH,
  PLACES_LIST_PATH,
} from "@/lib/explore-routes";
import { useExploreStore } from "@/store/explore-store";

type ExploreTraditionLinkProps = {
  href: typeof PLACES_LIST_PATH | typeof PEOPLE_LIST_PATH;
  traditions: string[];
  schools: string[];
  className?: string;
  children: ReactNode;
};

/** Applies tradition/school filters in the explore store, then navigates. */
export function ExploreTraditionLink({
  href,
  traditions,
  schools,
  className,
  children,
}: ExploreTraditionLinkProps) {
  const router = useRouter();
  const clearFilters = useExploreStore((s) => s.clearFilters);

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        clearFilters();
        useExploreStore.setState({
          traditions: [...traditions],
          schools: [...schools],
          entityFilter: href === PEOPLE_LIST_PATH ? "people" : "locations",
          hoveredId: null,
          pinnedPopupId: null,
          mapBounds: null,
        });
        router.push(href);
      }}
    >
      {children}
    </button>
  );
}

"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { entityFilterFromPath } from "@/lib/explore-routes";
import { useExploreStore } from "@/store/explore-store";

/**
 * Keep Zustand entityFilter aligned with the URL.
 * Syncs synchronously before paint so /places does not flash the All view.
 */
export function useExploreRouteSync() {
  const pathname = usePathname();
  const setEntityFilter = useExploreStore((s) => s.setEntityFilter);
  const lastPathRef = useRef<string | null>(null);

  const nextFilter = entityFilterFromPath(pathname);

  // First client render: align store before children paint when possible.
  if (lastPathRef.current === null) {
    const current = useExploreStore.getState().entityFilter;
    if (current !== nextFilter) {
      useExploreStore.setState({
        entityFilter: nextFilter,
        hoveredId: null,
        pinnedPopupId: null,
        mapBounds: null,
      });
    }
    lastPathRef.current = pathname;
  }

  useLayoutEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    setEntityFilter(nextFilter);
  }, [pathname, nextFilter, setEntityFilter]);
}

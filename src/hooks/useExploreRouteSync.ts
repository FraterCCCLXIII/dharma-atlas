"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { entityFilterFromPath } from "@/lib/explore-routes";
import { useExploreStore } from "@/store/explore-store";

/**
 * Keep Zustand entityFilter aligned with the URL.
 * Reconciles whenever the store drifts (soft nav, HMR, aborted renders).
 */
export function useExploreRouteSync() {
  const pathname = usePathname();
  const nextFilter = entityFilterFromPath(pathname);

  useLayoutEffect(() => {
    const current = useExploreStore.getState().entityFilter;
    if (current === nextFilter) return;
    useExploreStore.setState({
      entityFilter: nextFilter,
      hoveredId: null,
      pinnedPopupId: null,
      mapBounds: null,
    });
  }, [pathname, nextFilter]);
}

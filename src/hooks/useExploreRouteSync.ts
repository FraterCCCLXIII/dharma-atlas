"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { entityFilterFromPath } from "@/lib/explore-routes";
import { useExploreStore } from "@/store/explore-store";

export function useExploreRouteSync() {
  const pathname = usePathname();
  const setEntityFilter = useExploreStore((s) => s.setEntityFilter);

  useEffect(() => {
    setEntityFilter(entityFilterFromPath(pathname));
  }, [pathname, setEntityFilter]);
}

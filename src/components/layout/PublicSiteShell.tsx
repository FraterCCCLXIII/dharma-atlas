"use client";

import type { ReactNode } from "react";
import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { PublicNav } from "@/components/layout/SiteHeader";
import { PlaceFavoritesProvider } from "@/components/place/PlaceFavoritesProvider";
import { PilgrimageFavoritesProvider } from "@/components/pilgrimage/PilgrimageFavoritesProvider";
import { useScrollRailVisibility } from "@/hooks/useScrollRailVisibility";

export function PublicSiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname.startsWith("/admin");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [headerHovered, setHeaderHovered] = useState(false);
  const scrollRailVisible = useScrollRailVisibility(scrollRef, {
    resetKey: pathname,
  });
  const railVisible = scrollRailVisible || headerHovered;

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <PlaceFavoritesProvider>
      <PilgrimageFavoritesProvider>
        <div className="relative flex h-dvh flex-col overflow-hidden bg-surface">
          <PublicNav
            railVisible={railVisible}
            onHeaderHoverChange={setHeaderHovered}
          />
          <div
            ref={scrollRef}
            className="mb-[calc(var(--mobile-tab-bar-height)+env(safe-area-inset-bottom,0px))] flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface md:mb-0"
          >
            {children}
          </div>
          <MobileTabBar />
        </div>
      </PilgrimageFavoritesProvider>
    </PlaceFavoritesProvider>
  );
}

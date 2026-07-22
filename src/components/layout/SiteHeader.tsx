"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, SlidersHorizontal } from "@phosphor-icons/react";
import Link from "next/link";
import { ExploreSearchField } from "@/components/explore/ExploreSearchField";
import { ExploreNavLinks } from "@/components/explore/EntityToggle";
import { useActiveFilterCount } from "@/components/explore/FilterBar";
import { NavBarLogoContext } from "@/components/layout/NavBarLogoContext";
import { SiteLogo, SiteLogoWordmarkMeasure } from "@/components/layout/SiteLogo";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { useNavLogoCompact } from "@/hooks/useNavLogoCompact";
import { useExploreRouteSync } from "@/hooks/useExploreRouteSync";
import {
  entityFilterFromPath,
  isExplorePath,
  pathFromEntityFilter,
} from "@/lib/explore-routes";
import { useExploreStore } from "@/store/explore-store";

interface SiteHeaderProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  sticky?: boolean;
}

export function SiteHeader({
  children,
  className = "",
  innerClassName = "w-full",
  sticky = false,
}: SiteHeaderProps) {
  return (
    <header
      className={`relative z-50 h-[var(--site-header-height)] shrink-0 overflow-visible border-b border-border bg-surface-elevated/95 backdrop-blur-md ${sticky ? "sticky top-0" : ""} ${className}`}
    >
      <div
        className={`mx-auto flex h-full items-center px-4 sm:px-6 lg:px-8 ${innerClassName}`}
      >
        {children}
      </div>
    </header>
  );
}

function NavBarLayout({
  center,
  trailing,
  leading,
}: {
  center: ReactNode;
  trailing?: ReactNode;
  leading?: ReactNode;
}) {
  const navRowRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const leftClusterRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const wordmarkMeasureRef = useRef<HTMLImageElement>(null);
  const navLinksRef = useRef<HTMLElement>(null);
  const collision = useNavLogoCompact(
    navRowRef,
    logoRef,
    centerRef,
    wordmarkMeasureRef,
    leftClusterRef,
    navLinksRef,
  );

  return (
    <NavBarLogoContext.Provider value={collision}>
      <div
        ref={navRowRef}
        className="relative flex w-full min-w-0 items-center gap-2 sm:gap-3"
      >
        {leading}

        <div
          ref={leftClusterRef}
          className="relative z-10 flex min-w-0 shrink-0 items-center gap-1 sm:gap-2"
        >
          <SiteLogoWordmarkMeasure measureRef={wordmarkMeasureRef} />
          <SiteLogo logoRef={logoRef} />
          <ExploreNavLinks linksRef={navLinksRef} />
        </div>

        <div
          ref={centerRef}
          className="pointer-events-none absolute left-1/2 z-0 flex w-[min(100%-8rem,28rem)] -translate-x-1/2 justify-center sm:w-[min(100%-12rem,32rem)]"
        >
          <div className="pointer-events-auto w-full min-w-0">{center}</div>
        </div>

        <div className="relative z-10 ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {trailing}
          <SiteMenu />
        </div>
      </div>
    </NavBarLogoContext.Provider>
  );
}

function FilterToggleButton({
  filtersOpen,
  activeFilterCount,
  onToggle,
}: {
  filtersOpen: boolean;
  activeFilterCount: number;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={filtersOpen}
      aria-controls="explore-filters"
      aria-label={filtersOpen ? "Hide filters" : "Show filters"}
      className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition ${
        filtersOpen
          ? "border-accent bg-accent text-brand-foreground"
          : "border-border text-ink-secondary hover:border-border-strong hover:bg-surface-muted hover:text-ink"
      }`}
    >
      <SlidersHorizontal size={16} weight="bold" />
      <span className="hidden sm:inline">Filters</span>
      {activeFilterCount > 0 && (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[12px] font-semibold ${
            filtersOpen
              ? "bg-brand-foreground/15 text-brand-foreground"
              : "bg-brand text-brand-foreground"
          }`}
        >
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}

export function PublicNav() {
  useExploreRouteSync();
  const router = useRouter();
  const pathname = usePathname();
  const filtersOpen = useExploreStore((s) => s.filtersOpen);
  const toggleFilters = useExploreStore((s) => s.toggleFilters);
  const entityFilter = useExploreStore((s) => s.entityFilter);
  const traditions = useExploreStore((s) => s.traditions);
  const schools = useExploreStore((s) => s.schools);
  const types = useExploreStore((s) => s.types);
  const faiths = useExploreStore((s) => s.faiths);
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const activeFilterCount = useActiveFilterCount();

  const onExplore = isExplorePath(pathname);
  const pathFilter = entityFilterFromPath(pathname);
  const explorePath = pathFromEntityFilter(
    pathFilter === "people" ? "people" : "locations",
  );
  // Home feature view has no filter sidebar — hide the toggle too.
  const showHomeFeature =
    entityFilter === "all" &&
    traditions.length === 0 &&
    schools.length === 0 &&
    types.length === 0 &&
    faiths.length === 0 &&
    locationFilter == null;

  const handleFilterToggle = () => {
    if (onExplore) {
      toggleFilters();
      return;
    }

    useExploreStore.setState({ filtersOpen: true });
    router.push(explorePath);
  };

  return (
    <SiteHeader sticky>
      <NavBarLayout
        leading={
          onExplore ? undefined : (
            <Link
              href={explorePath}
              className="relative z-10 mr-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted md:hidden"
              aria-label="Back to map"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
          )
        }
        center={<ExploreSearchField />}
        trailing={
          showHomeFeature ? undefined : (
            <FilterToggleButton
              filtersOpen={filtersOpen}
              activeFilterCount={activeFilterCount}
              onToggle={handleFilterToggle}
            />
          )
        }
      />
    </SiteHeader>
  );
}

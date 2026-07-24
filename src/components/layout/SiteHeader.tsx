"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  // ArrowLeft,
  Plus,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import Link from "next/link";
import { ExploreSearchField } from "@/components/explore/ExploreSearchField";
import { ExploreNavLinks } from "@/components/explore/EntityToggle";
import { useActiveFilterCount } from "@/components/explore/FilterBar";
import {
  NavBarLogoContext,
  useNavBarChromeCompact,
} from "@/components/layout/NavBarLogoContext";
import { SiteLogo, SiteLogoWordmarkMeasure } from "@/components/layout/SiteLogo";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { useNavBarLayout } from "@/hooks/useNavLogoCompact";
import { useExploreRouteSync } from "@/hooks/useExploreRouteSync";
import {
  entityFilterFromPath,
  isExplorePath,
  pathFromEntityFilter,
  PILGRIMAGE_LIST_PATH,
} from "@/lib/explore-routes";
import { useExploreStore } from "@/store/explore-store";
import {
  usePilgrimageActiveFilterCount,
  usePilgrimageStore,
} from "@/store/pilgrimage-store";

interface SiteHeaderProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  sticky?: boolean;
  headerRef?: React.RefObject<HTMLElement | null>;
  onHoverChange?: (hovered: boolean) => void;
}

export function SiteHeader({
  children,
  className = "",
  innerClassName = "w-full",
  sticky = false,
  headerRef,
  onHoverChange,
}: SiteHeaderProps) {
  return (
    <header
      ref={headerRef}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      className={`relative z-50 shrink-0 overflow-visible border-b border-border bg-surface-elevated/95 backdrop-blur-md ${sticky ? "sticky top-0" : ""} ${className}`}
    >
      <div
        className={`mx-auto flex items-center px-4 sm:px-6 lg:px-8 ${innerClassName}`}
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
  railVisible,
}: {
  center: ReactNode;
  trailing?: ReactNode;
  leading?: ReactNode;
  railVisible: boolean;
}) {
  const navRowRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const leftClusterRef = useRef<HTMLDivElement>(null);
  const rightClusterRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const wordmarkMeasureRef = useRef<HTMLImageElement>(null);
  const collision = useNavBarLayout(
    navRowRef,
    leftClusterRef,
    rightClusterRef,
    centerRef,
    wordmarkMeasureRef,
  );

  return (
    <NavBarLogoContext.Provider value={collision}>
      <div className="flex w-full min-w-0 flex-col py-2">
        <div
          ref={navRowRef}
          className="relative flex h-10 w-full min-w-0 items-center gap-2 sm:gap-3"
        >
          <div
            ref={leftClusterRef}
            className="relative z-10 flex min-w-0 shrink-0 items-center gap-1 sm:gap-2"
          >
            {leading}
            <SiteLogoWordmarkMeasure measureRef={wordmarkMeasureRef} />
            <SiteLogo logoRef={logoRef} />
          </div>

          <div
            ref={centerRef}
            className="pointer-events-none absolute inset-y-0 left-12 right-[7.5rem] z-0 min-w-0"
          >
            <div className="pointer-events-auto h-full w-full min-w-0">
              {center}
            </div>
          </div>

          <div
            ref={rightClusterRef}
            className="relative z-10 ml-auto flex h-10 shrink-0 items-center gap-1.5 sm:gap-3"
          >
            {trailing}
            <AddPlaceButton />
            <SiteMenu />
          </div>
        </div>

        <div
          className={`hidden transition-[grid-template-rows] duration-300 ease-out md:grid ${
            railVisible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
          aria-hidden={!railVisible}
          inert={!railVisible || undefined}
        >
          <div className="overflow-hidden">
            <div
              className={`flex justify-center pt-1.5 transition-opacity duration-300 ${
                railVisible ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <ExploreNavLinks />
            </div>
          </div>
        </div>
      </div>
    </NavBarLogoContext.Provider>
  );
}

function AddPlaceButton() {
  const chromeCompact = useNavBarChromeCompact();
  const showShortLabel = chromeCompact !== false;
  const showFullLabel = chromeCompact !== true;

  return (
    <Link
      href="/add"
      className="hidden h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 text-sm font-semibold leading-none text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink min-[600px]:inline-flex sm:px-3.5"
    >
      <Plus size={16} weight="bold" className="shrink-0" />
      {showFullLabel ? (
        <span
          className={
            chromeCompact === false ? undefined : "hidden min-[1100px]:inline"
          }
        >
          Add a place
        </span>
      ) : null}
      {showShortLabel ? (
        <span
          className={
            chromeCompact === true ? undefined : "min-[1100px]:hidden"
          }
        >
          Add
        </span>
      ) : null}
    </Link>
  );
}

function FilterToggleButton({
  filtersOpen,
  activeFilterCount,
  onToggle,
  controlsId = "explore-filters",
}: {
  filtersOpen: boolean;
  activeFilterCount: number;
  onToggle: () => void;
  controlsId?: string;
}) {
  const chromeCompact = useNavBarChromeCompact();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={filtersOpen}
      aria-controls={controlsId}
      aria-label={filtersOpen ? "Hide filters" : "Show filters"}
      className={`relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-sm font-medium leading-none transition sm:px-3 ${
        filtersOpen
          ? "border-accent bg-accent text-brand-foreground"
          : "border-border bg-surface text-ink-secondary hover:border-border-strong hover:bg-surface-muted hover:text-ink"
      }`}
    >
      <SlidersHorizontal size={16} weight="bold" />
      {chromeCompact !== true ? (
        <span
          className={
            chromeCompact === false
              ? undefined
              : "hidden min-[1100px]:inline"
          }
        >
          Filters
        </span>
      ) : null}
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

export function PublicNav({
  railVisible = true,
  onHeaderHoverChange,
}: {
  railVisible?: boolean;
  onHeaderHoverChange?: (hovered: boolean) => void;
} = {}) {
  useExploreRouteSync();
  const router = useRouter();
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const filtersOpen = useExploreStore((s) => s.filtersOpen);
  const toggleFilters = useExploreStore((s) => s.toggleFilters);
  const pilgrimageFiltersOpen = usePilgrimageStore((s) => s.filtersOpen);
  const togglePilgrimageFilters = usePilgrimageStore((s) => s.toggleFilters);
  const entityFilter = useExploreStore((s) => s.entityFilter);
  const traditions = useExploreStore((s) => s.traditions);
  const schools = useExploreStore((s) => s.schools);
  const types = useExploreStore((s) => s.types);
  const faiths = useExploreStore((s) => s.faiths);
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const exploreActiveFilterCount = useActiveFilterCount();
  const pilgrimageActiveFilterCount = usePilgrimageActiveFilterCount();

  const onExplore = isExplorePath(pathname);
  const onPilgrimage =
    pathname === PILGRIMAGE_LIST_PATH ||
    pathname.startsWith(`${PILGRIMAGE_LIST_PATH}/`);
  const onCatalogSurface = onPilgrimage;
  const onExploreSurface = onExplore && !onCatalogSurface;
  // const showBackToMap = !onExplore && !onCatalogSurface;
  const pathFilter = entityFilterFromPath(pathname);
  const explorePath = pathFromEntityFilter(
    pathFilter === "people" ? "people" : "locations",
  );
  // Home feature view has no filter sidebar — hide the toggle too.
  // Coming-soon teaser pages (books / lineages) also hide filters.
  const showHomeFeature =
    !onCatalogSurface &&
    entityFilter === "all" &&
    traditions.length === 0 &&
    schools.length === 0 &&
    types.length === 0 &&
    faiths.length === 0 &&
    locationFilter == null;

  const handleFilterToggle = () => {
    if (onPilgrimage) {
      togglePilgrimageFilters();
      return;
    }

    if (onExploreSurface) {
      toggleFilters();
      return;
    }

    useExploreStore.setState({ filtersOpen: true });
    router.push(explorePath);
  };

  const filterToggleOpen = onPilgrimage ? pilgrimageFiltersOpen : filtersOpen;
  const filterToggleCount = onPilgrimage
    ? pilgrimageActiveFilterCount
    : exploreActiveFilterCount;
  const filterControlsId = onPilgrimage
    ? "pilgrimage-filters"
    : "explore-filters";
  // Detail pages for pilgrimage don't show the filter sidebar.
  // Books / lineages are coming-soon teasers — no filter chrome.
  const showFilterToggle =
    !showHomeFeature &&
    !pathname.startsWith("/books") &&
    !pathname.startsWith("/lineages") &&
    !(onPilgrimage && pathname !== PILGRIMAGE_LIST_PATH);

  // Keep layout offsets in sync as the rail expands/collapses.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const sync = () => {
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${header.offsetHeight}px`,
      );
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(header);
    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, [railVisible]);

  return (
    <SiteHeader
      sticky
      headerRef={headerRef}
      onHoverChange={onHeaderHoverChange}
    >
      <NavBarLayout
        railVisible={railVisible}
        leading={
          // Temporarily hide mobile "Back to map" — restore when ready.
          // showBackToMap ? (
          //   <Link
          //     href={explorePath}
          //     className="relative z-10 mr-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted md:hidden"
          //     aria-label="Back to map"
          //   >
          //     <ArrowLeft size={16} weight="bold" />
          //   </Link>
          // ) : undefined
          undefined
        }
        center={<ExploreSearchField />}
        trailing={
          showFilterToggle ? (
            <FilterToggleButton
              filtersOpen={filterToggleOpen}
              activeFilterCount={filterToggleCount}
              onToggle={handleFilterToggle}
              controlsId={filterControlsId}
            />
          ) : undefined
        }
      />
    </SiteHeader>
  );
}

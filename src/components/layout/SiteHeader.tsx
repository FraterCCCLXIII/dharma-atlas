"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Plus, SlidersHorizontal } from "@phosphor-icons/react";
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
  BOOKS_LIST_PATH,
  entityFilterFromPath,
  isExplorePath,
  pathFromEntityFilter,
} from "@/lib/explore-routes";
import {
  useBooksActiveFilterCount,
  useBooksStore,
} from "@/store/books-store";
import { useExploreStore } from "@/store/explore-store";

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
  const centerRef = useRef<HTMLDivElement>(null);
  const wordmarkMeasureRef = useRef<HTMLImageElement>(null);
  const collision = useNavLogoCompact(
    navRowRef,
    logoRef,
    centerRef,
    wordmarkMeasureRef,
    leftClusterRef,
  );

  return (
    <NavBarLogoContext.Provider value={collision}>
      <div className="flex w-full min-w-0 flex-col py-2">
        <div
          ref={navRowRef}
          className="relative flex h-10 w-full min-w-0 items-center gap-2 sm:gap-3"
        >
          {leading}

          <div
            ref={leftClusterRef}
            className="relative z-10 flex min-w-0 shrink-0 items-center gap-1 sm:gap-2"
          >
            <SiteLogoWordmarkMeasure measureRef={wordmarkMeasureRef} />
            <SiteLogo logoRef={logoRef} />
          </div>

          <div
            ref={centerRef}
            className="pointer-events-none absolute left-1/2 z-0 flex w-[min(100%-8rem,28rem)] -translate-x-1/2 justify-center sm:w-[min(100%-12rem,32rem)]"
          >
            <div className="pointer-events-auto w-full min-w-0">{center}</div>
          </div>

          <div className="relative z-10 ml-auto flex h-10 shrink-0 items-center gap-2 sm:gap-3">
            {trailing}
            <Link
              href="/add"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-sm font-semibold leading-none text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink sm:px-3.5"
            >
              <Plus size={16} weight="bold" className="shrink-0" />
              <span className="hidden sm:inline">Add a place</span>
              <span className="sm:hidden">Add</span>
            </Link>
            <SiteMenu />
          </div>
        </div>

        <div
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
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
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={filtersOpen}
      aria-controls={controlsId}
      aria-label={filtersOpen ? "Hide filters" : "Show filters"}
      className={`relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm font-medium leading-none transition ${
        filtersOpen
          ? "border-accent bg-accent text-brand-foreground"
          : "border-border bg-surface text-ink-secondary hover:border-border-strong hover:bg-surface-muted hover:text-ink"
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
  const booksFiltersOpen = useBooksStore((s) => s.filtersOpen);
  const toggleBooksFilters = useBooksStore((s) => s.toggleFilters);
  const entityFilter = useExploreStore((s) => s.entityFilter);
  const traditions = useExploreStore((s) => s.traditions);
  const schools = useExploreStore((s) => s.schools);
  const types = useExploreStore((s) => s.types);
  const faiths = useExploreStore((s) => s.faiths);
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const exploreActiveFilterCount = useActiveFilterCount();
  const booksActiveFilterCount = useBooksActiveFilterCount();

  const onExplore = isExplorePath(pathname);
  const onBooks =
    pathname === BOOKS_LIST_PATH || pathname.startsWith(`${BOOKS_LIST_PATH}/`);
  const onExploreSurface = onExplore && !onBooks;
  const showBackToMap = !onExplore && !onBooks;
  const pathFilter = entityFilterFromPath(pathname);
  const explorePath = pathFromEntityFilter(
    pathFilter === "people" ? "people" : "locations",
  );
  // Home feature view has no filter sidebar — hide the toggle too.
  const showHomeFeature =
    !onBooks &&
    entityFilter === "all" &&
    traditions.length === 0 &&
    schools.length === 0 &&
    types.length === 0 &&
    faiths.length === 0 &&
    locationFilter == null;

  const handleFilterToggle = () => {
    if (onBooks) {
      toggleBooksFilters();
      return;
    }

    if (onExploreSurface) {
      toggleFilters();
      return;
    }

    useExploreStore.setState({ filtersOpen: true });
    router.push(explorePath);
  };

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
          showBackToMap ? (
            <Link
              href={explorePath}
              className="relative z-10 mr-1 inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted md:hidden"
              aria-label="Back to map"
            >
              <ArrowLeft size={16} weight="bold" />
            </Link>
          ) : undefined
        }
        center={<ExploreSearchField />}
        trailing={
          showHomeFeature ? undefined : (
            <FilterToggleButton
              filtersOpen={onBooks ? booksFiltersOpen : filtersOpen}
              activeFilterCount={
                onBooks ? booksActiveFilterCount : exploreActiveFilterCount
              }
              onToggle={handleFilterToggle}
              controlsId={onBooks ? "books-filters" : "explore-filters"}
            />
          )
        }
      />
    </SiteHeader>
  );
}

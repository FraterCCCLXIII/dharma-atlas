"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ListBullets,
  MagnifyingGlass,
  MapTrifold,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { NavBarLogoContext } from "@/components/layout/NavBarLogoContext";
import { SiteLogo, SiteLogoWordmarkMeasure } from "@/components/layout/SiteLogo";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { useNavLogoCompact } from "@/hooks/useNavLogoCompact";
import {
  EntityToggle,
  getSearchPlaceholder,
} from "@/components/explore/EntityToggle";
import { useActiveFilterCount } from "@/components/explore/FilterBar";
import { entityFilterFromPath, isExplorePath, pathFromEntityFilter } from "@/lib/explore-routes";
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
      className={`relative z-50 shrink-0 overflow-visible border-b border-border bg-surface-elevated/95 backdrop-blur-md ${sticky ? "sticky top-0" : ""} ${className}`}
    >
      <div
        className={`mx-auto flex items-center px-4 py-3 sm:px-6 lg:px-8 ${innerClassName}`}
      >
        {children}
      </div>
    </header>
  );
}

function NavBarLayout({
  center,
  leading,
}: {
  center: ReactNode;
  leading?: ReactNode;
}) {
  const navRowRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const wordmarkMeasureRef = useRef<HTMLImageElement>(null);
  const compact = useNavLogoCompact(
    navRowRef,
    logoRef,
    centerRef,
    wordmarkMeasureRef,
  );

  return (
    <NavBarLogoContext.Provider value={compact}>
      <div ref={navRowRef} className="relative flex w-full items-center">
        {leading}

        <SiteLogoWordmarkMeasure measureRef={wordmarkMeasureRef} />
        <SiteLogo logoRef={logoRef} />

        <div
          ref={centerRef}
          className="absolute left-1/2 flex max-w-[calc(100%-7.5rem)] -translate-x-1/2 items-center gap-2 sm:max-w-[calc(100%-9rem)] sm:gap-3"
        >
          {center}
        </div>

        <div className="ml-auto shrink-0 pl-2">
          <SiteMenu />
        </div>
      </div>
    </NavBarLogoContext.Provider>
  );
}

function SearchField({
  onNavigateHome,
}: {
  onNavigateHome?: () => void;
}) {
  const query = useExploreStore((s) => s.query);
  const setQuery = useExploreStore((s) => s.setQuery);
  const entityFilter = useExploreStore((s) => s.entityFilter);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onNavigateHome?.();
    }
  };

  return (
    <label className="group relative block w-44 min-w-0 shrink sm:w-64 md:w-72">
      <span className="sr-only">Search directory</span>
      <MagnifyingGlass
        size={18}
        weight="bold"
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand"
      />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={getSearchPlaceholder(entityFilter)}
        className="w-full rounded-full border border-border bg-surface py-2.5 pl-11 pr-10 text-sm text-ink shadow-[var(--shadow-card)] outline-none transition placeholder:text-ink-muted hover:shadow-[0_2px_12px_rgba(58,52,43,0.08)] focus:border-brand focus:shadow-[0_0_0_3px_rgba(209,127,40,0.15)] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          aria-label="Clear search"
        >
          <X size={14} weight="bold" />
        </button>
      )}
    </label>
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

interface ExploreNavProps {
  activeFilterCount: number;
}

export function ExploreNav({ activeFilterCount }: ExploreNavProps) {
  const mobileView = useExploreStore((s) => s.mobileView);
  const setMobileView = useExploreStore((s) => s.setMobileView);
  const filtersOpen = useExploreStore((s) => s.filtersOpen);
  const toggleFilters = useExploreStore((s) => s.toggleFilters);
  const entityFilter = useExploreStore((s) => s.entityFilter);
  const showMapToggle = entityFilter !== "people";

  return (
    <SiteHeader>
      <NavBarLayout
        center={
          <>
            <EntityToggle />
            <SearchField />
            <FilterToggleButton
              filtersOpen={filtersOpen}
              activeFilterCount={activeFilterCount}
              onToggle={toggleFilters}
            />
            <div
              className={`flex shrink-0 rounded-full border border-border p-0.5 lg:hidden ${showMapToggle ? "" : "hidden"}`}
            >
              <button
                type="button"
                onClick={() => setMobileView("list")}
                aria-pressed={mobileView === "list"}
                aria-label="Show list"
                className={`rounded-full p-2 transition ${
                  mobileView === "list"
                    ? "bg-brand text-brand-foreground"
                    : "text-ink-secondary hover:text-ink"
                }`}
              >
                <ListBullets size={18} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => setMobileView("map")}
                aria-pressed={mobileView === "map"}
                aria-label="Show map"
                className={`rounded-full p-2 transition ${
                  mobileView === "map"
                    ? "bg-brand text-brand-foreground"
                    : "text-ink-secondary hover:text-ink"
                }`}
              >
                <MapTrifold size={18} weight="bold" />
              </button>
            </div>
          </>
        }
      />
    </SiteHeader>
  );
}

export function DetailNav() {
  const router = useRouter();
  const pathname = usePathname();
  const filtersOpen = useExploreStore((s) => s.filtersOpen);
  const toggleFilters = useExploreStore((s) => s.toggleFilters);
  const activeFilterCount = useActiveFilterCount();

  const explorePath = pathFromEntityFilter(entityFilterFromPath(pathname));

  const handleFilterToggle = () => {
    if (isExplorePath(pathname)) {
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
          <Link
            href={explorePath}
            className="mr-2 inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted md:hidden"
            aria-label="Back to map"
          >
            <ArrowLeft size={16} weight="bold" />
          </Link>
        }
        center={
          <>
            <EntityToggle />
            <SearchField onNavigateHome={() => router.push(explorePath)} />
            <FilterToggleButton
              filtersOpen={filtersOpen}
              activeFilterCount={activeFilterCount}
              onToggle={handleFilterToggle}
            />
          </>
        }
      />
    </SiteHeader>
  );
}

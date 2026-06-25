"use client";

import type { KeyboardEvent, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ListBullets,
  MagnifyingGlass,
  MapTrifold,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";
import { SiteLogo } from "@/components/layout/SiteLogo";
import {
  EntityToggle,
  getSearchPlaceholder,
} from "@/components/explore/EntityToggle";
import { entityFilterFromPath, pathFromEntityFilter } from "@/lib/explore-routes";
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
  innerClassName = "max-w-[1600px] w-full",
  sticky = false,
}: SiteHeaderProps) {
  return (
    <header
      className={`z-30 shrink-0 border-b border-border bg-surface-elevated/95 backdrop-blur-md ${sticky ? "sticky top-0" : ""} ${className}`}
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
  right,
}: {
  center: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:gap-4">
      <div className="justify-self-start">
        <SiteLogo />
      </div>

      <div className="min-w-0 justify-self-stretch px-1 sm:px-2">{center}</div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        {right}
      </div>
    </div>
  );
}

function NavSearch({
  onNavigateHome,
  trailing,
}: {
  onNavigateHome?: () => void;
  trailing?: ReactNode;
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
    <div className="flex w-full min-w-0 items-center gap-2 sm:gap-3">
      <EntityToggle />

      <label className="group relative block min-w-0 flex-1">
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
          className="w-full rounded-full border border-border bg-surface py-2.5 pl-11 pr-10 text-sm text-ink shadow-[var(--shadow-card)] outline-none transition placeholder:text-ink-muted hover:shadow-[0_2px_12px_rgba(58,52,43,0.08)] focus:border-brand focus:shadow-[0_0_0_3px_rgba(184,137,74,0.15)]"
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

      {trailing}
    </div>
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
          ? "border-ink bg-ink text-surface-elevated"
          : "border-border text-ink-secondary hover:border-border-strong hover:bg-surface-muted hover:text-ink"
      }`}
    >
      <SlidersHorizontal size={16} weight="bold" />
      <span className="hidden sm:inline">Filters</span>
      {activeFilterCount > 0 && (
        <span
          className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
            filtersOpen
              ? "bg-surface-elevated text-ink"
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
  resultCount: number;
  totalCount: number;
  activeFilterCount: number;
}

export function ExploreNav({
  resultCount,
  totalCount,
  activeFilterCount,
}: ExploreNavProps) {
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
          <NavSearch
            trailing={
              <FilterToggleButton
                filtersOpen={filtersOpen}
                activeFilterCount={activeFilterCount}
                onToggle={toggleFilters}
              />
            }
          />
        }
        right={
          <>
            <p className="hidden text-sm text-ink-secondary xl:block">
              <span className="font-semibold text-ink">{resultCount}</span>
              {resultCount !== totalCount && (
                <span className="text-ink-muted"> / {totalCount}</span>
              )}
            </p>

            <div
              className={`flex rounded-full border border-border p-0.5 lg:hidden ${showMapToggle ? "" : "hidden"}`}
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

  return (
    <SiteHeader sticky>
      <NavBarLayout
        center={
          <NavSearch
            onNavigateHome={() =>
              router.push(pathFromEntityFilter(entityFilterFromPath(pathname)))
            }
          />
        }
      />
    </SiteHeader>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ListBullets,
  MapTrifold,
  Path,
  Signpost,
} from "@phosphor-icons/react";
import {
  getPilgrimageImage,
  getRouteLatLngs,
  getRouteStopSites,
  PILGRIMAGE_ROUTES,
  PILGRIMAGE_SITES,
  pilgrimageRoutePath,
  pilgrimageSitePath,
  type PilgrimageRoute,
  type PilgrimageSite,
} from "@/data/pilgrimage";
import { cardLiftClassName } from "@/lib/card-styles";
import { traditionGradient } from "@/lib/places";
import {
  usePilgrimageActiveFilterCount,
  usePilgrimageStore,
} from "@/store/pilgrimage-store";
import { PilgrimageFilterBar } from "./PilgrimageFilterBar";
import type { PilgrimageMapMarker } from "./PilgrimageMap";

const PilgrimageMap = dynamic(
  () => import("./PilgrimageMap").then((m) => m.PilgrimageMap),
  { ssr: false },
);

function useDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

function matchesFilters(
  entry: { region: string; tradition: string; name: string; summary: string },
  regions: string[],
  traditions: string[],
  query: string,
): boolean {
  if (regions.length > 0 && !regions.includes(entry.region)) return false;
  if (traditions.length > 0 && !traditions.includes(entry.tradition)) {
    return false;
  }
  if (!query) return true;
  return (
    entry.name.toLowerCase().includes(query) ||
    entry.summary.toLowerCase().includes(query) ||
    entry.region.toLowerCase().includes(query) ||
    entry.tradition.toLowerCase().includes(query)
  );
}

function SiteCard({
  site,
  selected,
  onSelect,
}: {
  site: PilgrimageSite;
  selected: boolean;
  onSelect: () => void;
}) {
  const image = getPilgrimageImage(site.slug);

  return (
    <li>
      <div
        className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-surface-elevated shadow-[var(--shadow-card)] ${cardLiftClassName} ${
          selected
            ? "border-accent ring-2 ring-brand/25"
            : "border-border"
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex flex-1 flex-col text-left"
        >
          <div
            className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${traditionGradient(site.tradition)}`}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col gap-2 px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                {site.tradition}
              </p>
              <Signpost
                size={16}
                weight="bold"
                className="shrink-0 text-ink-muted"
              />
            </div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              {site.name}
            </h2>
            <p className="text-xs font-medium text-ink-muted">
              {site.country} · {site.region}
            </p>
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink-secondary">
              {site.summary}
            </p>
          </div>
        </button>
        <div className="border-t border-border px-4 py-2.5">
          <Link
            href={pilgrimageSitePath(site.slug)}
            className="text-xs font-semibold text-brand hover:underline"
          >
            View location →
          </Link>
        </div>
      </div>
    </li>
  );
}

function RouteCard({
  route,
  selected,
  onSelect,
}: {
  route: PilgrimageRoute;
  selected: boolean;
  onSelect: () => void;
}) {
  const stopCount = route.stopSlugs.length + (route.extraStops?.length ?? 0);
  const image = getPilgrimageImage(route.slug);

  return (
    <li>
      <div
        className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-surface-elevated shadow-[var(--shadow-card)] ${cardLiftClassName} ${
          selected
            ? "border-accent ring-2 ring-brand/25"
            : "border-border"
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex flex-1 flex-col text-left"
        >
          <div
            className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${traditionGradient(route.tradition)}`}
          >
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col gap-2 px-4 py-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                {route.tradition}
              </p>
              <Path
                size={16}
                weight="bold"
                className="shrink-0 text-ink-muted"
              />
            </div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              {route.name}
            </h2>
            <p className="text-xs font-medium text-ink-muted">
              {route.region} · {stopCount} stops
            </p>
            <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink-secondary">
              {route.summary}
            </p>
            <p className="mt-auto pt-2 text-xs text-ink-muted">
              {route.lengthNote}
            </p>
          </div>
        </button>
        <div className="border-t border-border px-4 py-2.5">
          <Link
            href={pilgrimageRoutePath(route.slug)}
            className="text-xs font-semibold text-brand hover:underline"
          >
            View route →
          </Link>
        </div>
      </div>
    </li>
  );
}

function PilgrimageFilterSidebar({
  filtersOpen,
  onClose,
}: {
  filtersOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {filtersOpen && (
        <button
          type="button"
          aria-label="Close filters"
          className="absolute inset-0 z-10 bg-ink/20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`flex shrink-0 flex-col overflow-hidden border-r border-border bg-surface-elevated transition-[width] duration-200 ease-out max-lg:absolute max-lg:inset-y-0 max-lg:left-0 max-lg:z-20 max-lg:w-[min(100%,18rem)] max-lg:shadow-[var(--shadow-card)] lg:relative lg:z-auto ${
          filtersOpen
            ? "lg:w-72"
            : "max-lg:hidden lg:w-0 lg:border-r-0"
        }`}
        aria-hidden={!filtersOpen}
      >
        <PilgrimageFilterBar onClose={onClose} />
      </aside>
    </>
  );
}

function MobileMapToggle() {
  const mobileView = usePilgrimageStore((s) => s.mobileView);
  const setMobileView = usePilgrimageStore((s) => s.setMobileView);
  const showingMap = mobileView === "map";

  return (
    <button
      type="button"
      aria-pressed={showingMap}
      aria-label={showingMap ? "Show list" : "Show map"}
      onClick={() => setMobileView(showingMap ? "list" : "map")}
      className={`absolute top-5 right-5 z-30 rounded-full border border-border bg-surface-elevated p-2.5 shadow-[var(--shadow-float)] transition hover:bg-surface-muted lg:hidden ${
        showingMap ? "text-brand" : "text-ink-secondary hover:text-ink"
      }`}
    >
      {showingMap ? (
        <ListBullets size={18} weight="bold" />
      ) : (
        <MapTrifold size={18} weight="bold" />
      )}
    </button>
  );
}

export function PilgrimagePageView() {
  const isDesktop = useDesktopLayout();
  const filtersOpen = usePilgrimageStore((s) => s.filtersOpen);
  const setFiltersOpen = usePilgrimageStore((s) => s.setFiltersOpen);
  const view = usePilgrimageStore((s) => s.view);
  const setView = usePilgrimageStore((s) => s.setView);
  const mobileView = usePilgrimageStore((s) => s.mobileView);
  const selectedSiteSlug = usePilgrimageStore((s) => s.selectedSiteSlug);
  const selectedRouteSlug = usePilgrimageStore((s) => s.selectedRouteSlug);
  const selectSite = usePilgrimageStore((s) => s.selectSite);
  const selectRoute = usePilgrimageStore((s) => s.selectRoute);
  const setMobileView = usePilgrimageStore((s) => s.setMobileView);
  const regions = usePilgrimageStore((s) => s.regions);
  const traditions = usePilgrimageStore((s) => s.traditions);
  const query = usePilgrimageStore((s) => s.query);
  const activeFilterCount = usePilgrimageActiveFilterCount();

  useEffect(() => {
    setFiltersOpen(isDesktop);
  }, [isDesktop, setFiltersOpen]);

  const normalizedQuery = query.trim().toLowerCase();

  const sites = useMemo(
    () =>
      PILGRIMAGE_SITES.filter((site) =>
        matchesFilters(site, regions, traditions, normalizedQuery),
      ),
    [regions, traditions, normalizedQuery],
  );

  const routes = useMemo(
    () =>
      PILGRIMAGE_ROUTES.filter((route) =>
        matchesFilters(route, regions, traditions, normalizedQuery),
      ),
    [regions, traditions, normalizedQuery],
  );

  const selectedRoute = useMemo(
    () => routes.find((route) => route.slug === selectedRouteSlug) ?? null,
    [routes, selectedRouteSlug],
  );

  // Keep selection valid as filters change.
  useEffect(() => {
    if (
      selectedRouteSlug &&
      !routes.some((route) => route.slug === selectedRouteSlug)
    ) {
      selectRoute(null);
    }
  }, [routes, selectedRouteSlug, selectRoute]);

  useEffect(() => {
    if (
      selectedSiteSlug &&
      !sites.some((site) => site.slug === selectedSiteSlug)
    ) {
      selectSite(null);
    }
  }, [sites, selectedSiteSlug, selectSite]);

  const routePoints = useMemo(
    () => (selectedRoute ? getRouteLatLngs(selectedRoute) : undefined),
    [selectedRoute],
  );

  const mapMarkers: PilgrimageMapMarker[] = useMemo(() => {
    if (view === "route" && selectedRoute) {
      return getRouteStopSites(selectedRoute).map((site, index) => ({
        ...site,
        stopNumber: site.templeNumber ?? index + 1,
      }));
    }

    if (view === "route") {
      const bySlug = new Map<string, PilgrimageSite>();
      for (const route of routes) {
        for (const site of getRouteStopSites(route)) {
          bySlug.set(site.slug, site);
        }
      }
      return [...bySlug.values()];
    }

    return sites;
  }, [view, selectedRoute, routes, sites]);

  const mapFocusKey = useMemo(() => {
    if (selectedRoute) return `route:${selectedRoute.slug}`;
    if (selectedSiteSlug) return `site:${selectedSiteSlug}`;
    return `view:${view}:${mapMarkers.map((m) => m.slug).join(",")}`;
  }, [selectedRoute, selectedSiteSlug, view, mapMarkers]);

  const focusPoints = useMemo(() => {
    if (selectedRoute) return getRouteLatLngs(selectedRoute);
    if (selectedSiteSlug) {
      const site = sites.find((entry) => entry.slug === selectedSiteSlug);
      if (site) return [[site.lat, site.lng] as [number, number]];
    }
    return undefined;
  }, [selectedRoute, selectedSiteSlug, sites]);

  const entries = view === "site" ? sites : routes;
  const total =
    view === "site" ? PILGRIMAGE_SITES.length : PILGRIMAGE_ROUTES.length;
  const mapMounted = isDesktop || mobileView === "map";

  const handleSelectSite = (slug: string) => {
    selectSite(slug);
    if (!isDesktop) setMobileView("map");
  };

  const handleSelectRoute = (slug: string) => {
    selectRoute(slug);
    if (!isDesktop) setMobileView("map");
  };

  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden bg-surface">
      <PilgrimageFilterSidebar
        filtersOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1">
        <section
          className={`flex min-h-0 w-full flex-col lg:w-[52%] xl:w-[48%] ${
            mobileView === "map" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="px-4 pb-20 pt-8 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                  <MapTrifold size={14} weight="bold" />
                  Sacred geography
                </p>
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  Pilgrimage
                </h1>
                <p className="mt-3 text-base leading-relaxed text-ink-secondary">
                  Sacred sites and walking routes across Buddhist and related
                  contemplative traditions — select a route to trace it on the
                  map.
                </p>
              </div>

              <div
                role="tablist"
                aria-label="Pilgrimage view"
                className="mt-8 inline-flex rounded-full border border-border bg-surface-muted p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "site"}
                  onClick={() => setView("site")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    view === "site"
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  <Signpost size={15} weight="bold" />
                  Locations
                  <span className="text-[11px] font-medium opacity-80">
                    {sites.length}
                  </span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={view === "route"}
                  onClick={() => setView("route")}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    view === "route"
                      ? "bg-brand text-brand-foreground shadow-sm"
                      : "text-ink-secondary hover:text-ink"
                  }`}
                >
                  <Path size={15} weight="bold" />
                  Routes
                  <span className="text-[11px] font-medium opacity-80">
                    {routes.length}
                  </span>
                </button>
              </div>

              <p className="mt-4 text-sm text-ink-muted">
                Showing {entries.length} of {total}
                {activeFilterCount > 0
                  ? " matching filters"
                  : view === "site"
                    ? " locations"
                    : " routes"}
                {selectedRoute ? ` · ${selectedRoute.name} on map` : ""}
              </p>

              {entries.length === 0 ? (
                <p className="mt-12 text-sm text-ink-secondary">
                  No {view === "site" ? "locations" : "routes"} match these
                  filters. Try clearing a region or tradition.
                </p>
              ) : view === "site" ? (
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {sites.map((site) => (
                    <SiteCard
                      key={site.slug}
                      site={site}
                      selected={selectedSiteSlug === site.slug}
                      onSelect={() => handleSelectSite(site.slug)}
                    />
                  ))}
                </ul>
              ) : (
                <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                  {routes.map((route) => (
                    <RouteCard
                      key={route.slug}
                      route={route}
                      selected={selectedRouteSlug === route.slug}
                      onSelect={() => handleSelectRoute(route.slug)}
                    />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        <section
          aria-hidden={!mapMounted}
          className={`relative z-0 min-h-0 flex-1 p-3 sm:p-4 lg:p-5 ${
            mobileView === "list" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="relative h-full" data-map-shell>
            <div className="map-panel absolute inset-0 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
            {mapMounted ? (
              <PilgrimageMap
                markers={mapMarkers}
                routePoints={
                  routePoints && routePoints.length >= 2
                    ? routePoints
                    : undefined
                }
                focusPoints={focusPoints}
                activeSlug={selectedSiteSlug}
                focusKey={mapFocusKey}
                onSelectSite={handleSelectSite}
              />
            ) : null}
            {selectedRoute && mapMounted ? (
              <div className="absolute bottom-3 left-3 right-3 z-[1000] rounded-xl border border-border bg-[var(--map-overlay)] px-3.5 py-2.5 text-sm shadow-[var(--shadow-float)] backdrop-blur-sm sm:right-auto sm:max-w-sm">
                <p className="font-semibold text-ink">{selectedRoute.name}</p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {getRouteStopSites(selectedRoute).length} mapped stops ·{" "}
                  {selectedRoute.lengthNote}
                </p>
              </div>
            ) : null}
            </div>
          </div>
        </section>

        <MobileMapToggle />
      </div>
    </div>
  );
}

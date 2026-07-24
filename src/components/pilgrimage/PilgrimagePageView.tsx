"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ListBullets,
  MapPin,
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
import {
  cardImageFrameClassName,
  cardImagePaddingClassName,
  cardLiftClassName,
} from "@/lib/card-styles";
import { traditionGradient } from "@/lib/places";
import {
  usePilgrimageActiveFilterCount,
  usePilgrimageStore,
} from "@/store/pilgrimage-store";
import { MobileMapResultsPanel } from "@/components/explore/MobileMapResultsPanel";
import {
  MAP_SPLIT_PANE_DESKTOP,
  MAP_SPLIT_PANE_MOBILE,
  MAP_SPLIT_SHELL,
} from "@/lib/map-shell-layout";
import { PilgrimageFavoriteButton } from "./PilgrimageFavoriteButton";
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
      <article
        className={`relative rounded-2xl ${cardLiftClassName} ${
          selected ? "bg-surface-muted ring-2 ring-brand/25" : ""
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          className="group block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <div className={cardImagePaddingClassName}>
            <div
              className={`relative flex h-36 items-end bg-gradient-to-br ${cardImageFrameClassName} ${traditionGradient(site.tradition)}`}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full rounded-xl object-cover"
                />
              ) : null}
              <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="relative m-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[12px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
                <Signpost size={12} weight="bold" />
                Site
              </span>
            </div>
          </div>

          <div className="px-4 pt-1">
            <div className="space-y-1">
              <h2 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
                {site.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                <MapPin size={14} weight="bold" className="shrink-0" />
                <span className="line-clamp-1">
                  {site.country} · {site.region}
                </span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
              <span className="rounded-md bg-surface-muted px-2 py-0.5 font-medium">
                {site.tradition}
              </span>
              {site.templeNumber != null ? (
                <span className="rounded-md bg-surface-muted px-2 py-0.5 font-medium">
                  Temple {site.templeNumber}
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
              {site.summary}
            </p>
          </div>
        </button>
        <div className="px-4 pb-4 pt-2">
          <Link
            href={pilgrimageSitePath(site.slug)}
            className="text-xs font-semibold text-brand hover:underline"
          >
            View location →
          </Link>
        </div>
        <div className="absolute right-5 top-5 z-10">
          <PilgrimageFavoriteButton
            kind="site"
            slug={site.slug}
            variant="overlay"
          />
        </div>
      </article>
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
      <article
        className={`relative rounded-2xl ${cardLiftClassName} ${
          selected ? "bg-surface-muted ring-2 ring-brand/25" : ""
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          className="group block w-full rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <div className={cardImagePaddingClassName}>
            <div
              className={`relative flex h-36 items-end bg-gradient-to-br ${cardImageFrameClassName} ${traditionGradient(route.tradition)}`}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full rounded-xl object-cover"
                />
              ) : null}
              <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <span className="relative m-3 inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[12px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
                <Path size={12} weight="bold" />
                Route
              </span>
            </div>
          </div>

          <div className="px-4 pt-1">
            <div className="space-y-1">
              <h2 className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
                {route.name}
              </h2>
              <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                <Path size={14} weight="bold" className="shrink-0" />
                <span className="line-clamp-1">
                  {route.region} · {stopCount} stops
                </span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
              <span className="rounded-md bg-surface-muted px-2 py-0.5 font-medium">
                {route.tradition}
              </span>
              {route.lengthNote ? (
                <span className="rounded-md bg-surface-muted px-2 py-0.5 font-medium">
                  {route.lengthNote}
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-secondary">
              {route.summary}
            </p>
          </div>
        </button>
        <div className="px-4 pb-4 pt-2">
          <Link
            href={pilgrimageRoutePath(route.slug)}
            className="text-xs font-semibold text-brand hover:underline"
          >
            View route →
          </Link>
        </div>
        <div className="absolute right-5 top-5 z-10">
          <PilgrimageFavoriteButton
            kind="route"
            slug={route.slug}
            variant="overlay"
          />
        </div>
      </article>
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

  const mapStrip = !isDesktop && mobileView === "map";

  const kindToggle = (
    <div
      role="tablist"
      aria-label="Pilgrimage view"
      className={`inline-flex rounded-full border border-border bg-surface-muted p-0.5 ${
        mapStrip ? "max-w-full" : "mt-8 p-1"
      }`}
    >
      <button
        type="button"
        role="tab"
        aria-selected={view === "site"}
        onClick={() => setView("site")}
        className={`inline-flex items-center gap-1 rounded-full font-semibold transition ${
          mapStrip
            ? "gap-1 px-2.5 py-1.5 text-xs"
            : "gap-1.5 px-4 py-2 text-sm"
        } ${
          view === "site"
            ? "bg-brand text-brand-foreground shadow-sm"
            : "text-ink-secondary hover:text-ink"
        }`}
      >
        <Signpost size={mapStrip ? 13 : 15} weight="bold" />
        {mapStrip ? "Sites" : "Locations"}
        <span className="text-[11px] font-medium opacity-80">
          {sites.length}
        </span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={view === "route"}
        onClick={() => setView("route")}
        className={`inline-flex items-center gap-1 rounded-full font-semibold transition ${
          mapStrip
            ? "gap-1 px-2.5 py-1.5 text-xs"
            : "gap-1.5 px-4 py-2 text-sm"
        } ${
          view === "route"
            ? "bg-brand text-brand-foreground shadow-sm"
            : "text-ink-secondary hover:text-ink"
        }`}
      >
        <Path size={mapStrip ? 13 : 15} weight="bold" />
        Routes
        <span className="text-[11px] font-medium opacity-80">
          {routes.length}
        </span>
      </button>
    </div>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-1 overflow-hidden bg-surface">
      <PilgrimageFilterSidebar
        filtersOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      />

      <div
        className={`relative flex min-h-0 min-w-0 flex-1 ${
          mapStrip ? "flex-col lg:flex-row" : "lg:flex-row"
        }`}
      >
        <section
          className={`min-h-0 min-w-0 w-full flex-col lg:relative lg:order-none lg:flex lg:w-[52%] lg:max-w-[52%] lg:shrink-0 xl:w-[48%] xl:max-w-[48%] ${
            mapStrip
              ? "order-2 flex shrink-0 px-3 sm:px-4 lg:order-none lg:min-h-0 lg:max-w-none lg:flex-1 lg:px-0"
              : "flex"
          }`}
        >
          {mapStrip ? (
            <MobileMapResultsPanel
              leading={kindToggle}
              empty={
                entries.length === 0
                  ? `No ${view === "site" ? "sites" : "routes"} match these filters.`
                  : undefined
              }
            >
              {entries.length === 0
                ? null
                : view === "site"
                  ? sites.map((site) => (
                      <PilgrimageStripCard
                        key={site.slug}
                        title={site.name}
                        subtitle={`${site.country} · ${site.region}`}
                        image={getPilgrimageImage(site.slug)}
                        tradition={site.tradition}
                        selected={selectedSiteSlug === site.slug}
                        onSelect={() => handleSelectSite(site.slug)}
                        href={pilgrimageSitePath(site.slug)}
                      />
                    ))
                  : routes.map((route) => (
                      <PilgrimageStripCard
                        key={route.slug}
                        title={route.name}
                        subtitle={`${getRouteStopSites(route).length} stops · ${route.lengthNote}`}
                        image={getPilgrimageImage(route.slug)}
                        tradition={route.tradition}
                        selected={selectedRouteSlug === route.slug}
                        onSelect={() => handleSelectRoute(route.slug)}
                        href={pilgrimageRoutePath(route.slug)}
                      />
                    ))}
            </MobileMapResultsPanel>
          ) : (
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

                {kindToggle}

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
          )}
        </section>

        <section
          aria-hidden={!mapMounted}
          className={
            mobileView === "list" ? MAP_SPLIT_PANE_DESKTOP : MAP_SPLIT_PANE_MOBILE
          }
        >
          <div className={MAP_SPLIT_SHELL} data-map-shell>
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

function PilgrimageStripCard({
  title,
  subtitle,
  image,
  tradition,
  selected,
  onSelect,
  href,
}: {
  title: string;
  subtitle: string;
  image: string | undefined;
  tradition: string;
  selected: boolean;
  onSelect: () => void;
  href: string;
}) {
  return (
    <article
      className={`w-[15.5rem] shrink-0 overflow-hidden rounded-2xl border bg-surface-elevated/90 ${
        selected ? "border-brand ring-2 ring-brand/25" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="block w-full text-left"
      >
        <div
          className={`relative h-24 bg-gradient-to-br ${traditionGradient(tradition)}`}
        >
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        </div>
        <div className="px-2.5 py-2">
          <h3 className="line-clamp-1 font-display text-sm font-semibold text-ink">
            {title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">{subtitle}</p>
        </div>
      </button>
      <div className="border-t border-border px-2.5 py-1.5">
        <Link
          href={href}
          className="text-[11px] font-semibold text-brand hover:underline"
        >
          Open →
        </Link>
      </div>
    </article>
  );
}

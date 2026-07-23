"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import {
  getPilgrimageSite,
  getRouteLatLngs,
  getRouteStopSites,
  type PilgrimageRoute,
} from "@/data/pilgrimage";

const PilgrimageMap = dynamic(
  () => import("./PilgrimageMap").then((m) => m.PilgrimageMap),
  { ssr: false },
);

export function PilgrimageRouteMap({
  route,
  className,
  frameClassName,
  hoveredSlug,
  /** When set, draws this stop order instead of the canonical route. */
  stopSlugs,
}: {
  route: PilgrimageRoute;
  /** Height / shell classes; defaults to a compact embedded map. */
  className?: string;
  /** Classes for the bordered map frame (rounded corners, border, etc.). */
  frameClassName?: string;
  /** Stop hovered in the list — shows that marker’s hovercard. */
  hoveredSlug?: string | null;
  stopSlugs?: string[];
}) {
  const effectiveRoute = useMemo((): PilgrimageRoute => {
    if (!stopSlugs) return route;
    return { ...route, stopSlugs };
  }, [route, stopSlugs]);

  const markers = useMemo(
    () =>
      (stopSlugs
        ? stopSlugs
            .map((slug) => getPilgrimageSite(slug))
            .filter((site): site is NonNullable<typeof site> => site != null)
        : getRouteStopSites(route)
      ).map((site, index) => ({
        ...site,
        stopNumber: index + 1,
      })),
    [route, stopSlugs],
  );
  const routePoints = useMemo(
    () => getRouteLatLngs(effectiveRoute),
    [effectiveRoute],
  );
  const focusKey = stopSlugs
    ? `customize:${route.slug}:${stopSlugs.join(",")}`
    : `route-detail:${route.slug}`;

  if (routePoints.length < 2) {
    return (
      <div
        className={className ?? "relative h-[360px]"}
        data-map-shell
      >
        <div
          className={
            frameClassName ??
            "map-panel absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-[var(--shadow-card)]"
          }
        >
          <p className="px-6 text-center text-sm text-ink-muted">
            Add at least two mapped stops to preview the route.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={className ?? "relative h-[360px]"}
      data-map-shell
    >
      <div
        className={
          frameClassName ??
          "map-panel absolute inset-0 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]"
        }
      >
        <PilgrimageMap
          markers={markers}
          routePoints={routePoints}
          focusPoints={routePoints}
          hoveredSlug={hoveredSlug}
          focusKey={focusKey}
        />
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import {
  getRouteLatLngs,
  getRouteStopSites,
  type PilgrimageRoute,
} from "@/data/pilgrimage";

const PilgrimageMap = dynamic(
  () => import("./PilgrimageMap").then((m) => m.PilgrimageMap),
  { ssr: false },
);

export function PilgrimageRouteMap({ route }: { route: PilgrimageRoute }) {
  const markers = useMemo(
    () =>
      getRouteStopSites(route).map((site, index) => ({
        ...site,
        stopNumber: site.templeNumber ?? index + 1,
      })),
    [route],
  );
  const routePoints = useMemo(() => getRouteLatLngs(route), [route]);

  if (routePoints.length < 2) return null;

  return (
    <div className="relative h-[360px]" data-map-shell>
      <div className="map-embedded absolute inset-0 overflow-hidden rounded-2xl border border-border shadow-[var(--shadow-card)]">
        <PilgrimageMap
          markers={markers}
          routePoints={routePoints}
          focusPoints={routePoints}
          focusKey={`route-detail:${route.slug}`}
        />
      </div>
    </div>
  );
}

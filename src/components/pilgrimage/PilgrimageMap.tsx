"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Signpost } from "@phosphor-icons/react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { PilgrimageSite } from "@/data/pilgrimage";
import { hasValidCoords } from "@/lib/coords";
import { MapPopupPaneHost } from "@/components/map/MapPopupPaneHost";
import {
  cancelHoverClose,
  MAP_HOVER_POPUP_OPTIONS,
  openMarkerPopupNow,
  openMarkerPopupWhenReady,
  scheduleHoverClose,
} from "@/lib/map-popup";
import { traditionMarkerColor } from "@/lib/places";
import { PilgrimageMapPopoverCard } from "./PilgrimageMapPopoverCard";

const DEFAULT_CENTER: [number, number] = [27.5, 84];
const DEFAULT_ZOOM = 4;
const ROUTE_COLOR = "#d17f28";

function createPilgrimageMarkerIcon({
  tradition,
  active,
  stopNumber,
}: {
  tradition: string;
  active: boolean;
  stopNumber?: number;
}): L.DivIcon {
  const color = traditionMarkerColor(tradition);
  const html = renderToStaticMarkup(
    createElement(
      "div",
      {
        className: `map-marker${active ? " map-marker--active" : ""}`,
      },
      createElement(
        "div",
        {
          className: "map-marker__circle",
          style: { backgroundColor: color, color },
        },
        stopNumber != null
          ? createElement(
              "span",
              { className: "map-marker__count" },
              String(stopNumber),
            )
          : createElement(Signpost, {
              size: 14,
              weight: "bold",
              color: "#fffcf7",
            }),
      ),
    ),
  );

  return L.divIcon({
    className: "map-marker-wrap",
    html,
    iconSize: [32, 36],
    iconAnchor: [16, 36],
    popupAnchor: [0, 0],
  });
}

function FitToPoints({
  points,
  focusKey,
}: {
  points: [number, number][];
  focusKey: string;
}) {
  const map = useMap();
  // Sort so reordering the same stops (customize drag) does not re-fit.
  const pointsKey = [...points]
    .map((p) => p.join(","))
    .sort()
    .join("|");

  useEffect(() => {
    if (points.length === 0) return;

    map.whenReady(() => {
      if (points.length === 1) {
        map.setView(points[0], 8, { animate: true });
        return;
      }
      map.fitBounds(L.latLngBounds(points), {
        padding: [48, 48],
        maxZoom: 9,
        animate: true,
      });
    });
    // focusKey / pointsKey capture intentional refits; points read from closure.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refit only when selection/data identity changes
  }, [map, focusKey, pointsKey]);

  return null;
}

export type PilgrimageMapMarker = PilgrimageSite & {
  stopNumber?: number;
};

function PilgrimageMapPin({
  site,
  isActive,
  isListHovered,
  onSelectSite,
}: {
  site: PilgrimageMapMarker;
  isActive: boolean;
  /** Hovered from the stop list — opens the same hovercard as marker hover. */
  isListHovered: boolean;
  onSelectSite?: (slug: string) => void;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hovered, setHovered] = useState(false);

  const icon = useMemo(
    () =>
      createPilgrimageMarkerIcon({
        tradition: site.tradition,
        active: isActive || hovered || site.stopNumber != null,
        stopNumber: site.stopNumber,
      }),
    [site.tradition, site.stopNumber, isActive, hovered],
  );

  const showPopup = () => {
    cancelHoverClose(hideTimerRef);
    setHovered(true);
    const marker = markerRef.current;
    if (marker) openMarkerPopupNow(marker);
  };

  const scheduleHide = () => {
    scheduleHoverClose(hideTimerRef, () => {
      setHovered(false);
      markerRef.current?.closePopup();
    });
  };

  useEffect(() => {
    const shouldShow = isActive || isListHovered;
    if (!shouldShow) {
      if (!hovered) markerRef.current?.closePopup();
      return;
    }

    const marker = markerRef.current;
    if (!marker || marker.isPopupOpen()) return;

    return openMarkerPopupWhenReady(map, marker);
  }, [isActive, isListHovered, hovered, map]);

  useEffect(() => () => cancelHoverClose(hideTimerRef), []);

  return (
    <Marker
      ref={markerRef}
      position={[site.lat, site.lng]}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectSite?.(site.slug);
          showPopup();
        },
        mouseover: showPopup,
        mouseout: scheduleHide,
      }}
    >
      <Popup
        {...MAP_HOVER_POPUP_OPTIONS}
        eventHandlers={{
          mouseover: showPopup,
          mouseout: scheduleHide,
        }}
      >
        <PilgrimageMapPopoverCard
          site={site}
          stopNumber={site.stopNumber}
        />
      </Popup>
    </Marker>
  );
}

export function PilgrimageMap({
  markers,
  routePoints,
  focusPoints,
  activeSlug,
  hoveredSlug,
  focusKey,
  onSelectSite,
}: {
  markers: PilgrimageMapMarker[];
  routePoints?: [number, number][];
  /** Optional override for fitBounds (e.g. a single selected site). */
  focusPoints?: [number, number][];
  activeSlug?: string | null;
  /** Stop hovered in the list — shows that marker’s hovercard. */
  hoveredSlug?: string | null;
  /** Change this to re-run fitBounds (e.g. selected route slug). */
  focusKey: string;
  onSelectSite?: (slug: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const pins = useMemo(
    () => markers.filter((site) => hasValidCoords(site.lat, site.lng)),
    [markers],
  );

  const fitPoints = useMemo(() => {
    if (focusPoints && focusPoints.length > 0) return focusPoints;
    if (routePoints && routePoints.length > 0) return routePoints;
    return pins.map((site) => [site.lat, site.lng] as [number, number]);
  }, [focusPoints, pins, routePoints]);

  if (!mounted) {
    return <div className="h-full min-h-[320px] bg-surface-muted" aria-hidden />;
  }

  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      className="h-full min-h-[320px] w-full"
      scrollWheelZoom
      closePopupOnClick={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapPopupPaneHost />
      <FitToPoints points={fitPoints} focusKey={focusKey} />
      {routePoints && routePoints.length >= 2 ? (
        <Polyline
          positions={routePoints}
          pathOptions={{
            color: ROUTE_COLOR,
            weight: 4,
            opacity: 0.9,
            lineJoin: "round",
            lineCap: "round",
          }}
        />
      ) : null}
      {pins.map((site) => (
        <PilgrimageMapPin
          key={site.slug}
          site={site}
          isActive={activeSlug === site.slug}
          isListHovered={hoveredSlug === site.slug}
          onSelectSite={onSelectSite}
        />
      ))}
    </MapContainer>
  );
}

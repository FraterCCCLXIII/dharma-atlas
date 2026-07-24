"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { MapPopoverCard } from "@/components/explore/MapPopoverCard";
import { PlaceMarkerCluster } from "@/components/explore/PlaceMarkerCluster";
import {
  createPlaceMarkerIcon,
  getMarkerIconOpacity,
  getMarkerScale,
} from "@/lib/map-markers";
import { MapPopupPaneHost } from "@/components/map/MapPopupPaneHost";
import {
  MAP_RESIZE_SETTLE_MS,
  MapResizeSettle,
} from "@/components/map/MapResizeSettle";
import {
  cancelHoverClose,
  isLatLngInMapContainer,
  MAP_HOVER_POPUP_OPTIONS,
  openMarkerPopupNow,
  openMarkerPopupWhenReady,
  scheduleHoverClose,
} from "@/lib/map-popup";
import {
  isValidCoord,
  sameLngOffsets,
  toLatLng,
  worldLngOffsetsForBounds,
} from "@/lib/coords";
import { placeShowsMapPin } from "@/lib/place-location";
import {
  loadStoredNearBounds,
  resolveNearBoundsForLabeling,
  storeNearBounds,
} from "@/lib/user-location";
import { useExploreStore } from "@/store/explore-store";
import type { ExploreMapPin, PlaceMarker } from "@/types/place";

type MapPlace = ExploreMapPin | PlaceMarker;

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;
/** Floor for zoom-out; vertical pan clamp + world marker copies cover the rest. */
const MIN_ZOOM = 2.5;
/** Web Mercator world edge — matches Leaflet’s SphericalMercator.MAX_LATITUDE. */
const WORLD_MAX_LAT = 85.0511287798;

interface PlaceMapProps {
  places: MapPlace[];
}

/**
 * Keep the projected world covering the vertical midpoint of the container:
 * the world top may not sit below 50%, and the world bottom may not sit above 50%.
 * Also syncs `--map-world-top` so empty polar bands stay solid ocean / land fills.
 */
function MapVerticalPanClamp() {
  const map = useMap();
  const clampingRef = useRef(false);

  useEffect(() => {
    const container = map.getContainer();

    const syncWorldTopFill = (northY: number) => {
      const height = map.getSize().y;
      const edge = Math.max(0, Math.min(height, northY));
      container.style.setProperty("--map-world-top", `${edge}px`);
    };

    // CSS fill can update during drag; panBy must NOT — it fights the gesture
    // and makes the map feel stuck / hard to pan.
    const syncFill = () => {
      const lng = map.getCenter().lng;
      const northY = map.latLngToContainerPoint([WORLD_MAX_LAT, lng]).y;
      syncWorldTopFill(northY);
    };

    const clamp = () => {
      if (clampingRef.current) return;

      const size = map.getSize();
      const midY = size.y / 2;
      if (!(midY > 0)) return;

      const lng = map.getCenter().lng;
      const northY = map.latLngToContainerPoint([WORLD_MAX_LAT, lng]).y;
      const southY = map.latLngToContainerPoint([-WORLD_MAX_LAT, lng]).y;

      syncWorldTopFill(northY);

      let dy = 0;
      if (northY > midY) {
        // World top drifted below the midline — pan south so content moves up.
        dy = northY - midY;
      } else if (southY < midY) {
        // World bottom drifted above the midline — pan north so content moves down.
        dy = southY - midY;
      }

      if (Math.abs(dy) < 0.5) return;

      clampingRef.current = true;
      map.panBy([0, dy], { animate: false });
      clampingRef.current = false;
    };

    map.whenReady(clamp);
    map.on("move", syncFill);
    map.on("moveend", clamp);
    map.on("zoomend", clamp);
    map.on("resize", clamp);

    return () => {
      map.off("move", syncFill);
      map.off("moveend", clamp);
      map.off("zoomend", clamp);
      map.off("resize", clamp);
      container.style.removeProperty("--map-world-top");
    };
  }, [map]);

  return null;
}

function MapAutoControl({ places }: { places: MapPlace[] }) {
  const map = useMap();
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const userInteractedRef = useRef(false);
  const programmaticRef = useRef(false);
  /** Last Near You / area location we framed — not tied to the pin-set fingerprint. */
  const lastFittedLocationKeyRef = useRef<string | null>(null);
  const fittedLocationWithPointsRef = useRef(false);
  // After refresh / near-seeded mount, keep the camera instead of re-fitting.
  const restoredMapView = useRef(useExploreStore.getState().mapView).current;
  const seededFromNearYou = useRef(
    restoredMapView == null && loadStoredNearBounds() != null,
  ).current;
  const initialLocalViewAppliedRef = useRef(
    restoredMapView != null || seededFromNearYou,
  );
  const suppressRestoredLocationFitRef = useRef(restoredMapView != null);
  const restoredLocationKeyRef = useRef<string | null>(null);

  const placesKey = useMemo(() => places.map((p) => p.id).join(","), [places]);
  const locationKey = locationFilter
    ? `${locationFilter.label}:${locationFilter.bounds.south}:${locationFilter.bounds.north}:${locationFilter.bounds.west}:${locationFilter.bounds.east}`
    : null;

  if (
    suppressRestoredLocationFitRef.current &&
    restoredLocationKeyRef.current === null &&
    locationKey
  ) {
    restoredLocationKeyRef.current = locationKey;
  }

  useEffect(() => {
    const markUserInteraction = () => {
      if (!programmaticRef.current) {
        userInteractedRef.current = true;
      }
    };

    map.on("dragstart", markUserInteraction);
    map.on("zoomstart", markUserInteraction);

    return () => {
      map.off("dragstart", markUserInteraction);
      map.off("zoomstart", markUserInteraction);
    };
  }, [map]);

  const runProgrammatic = (action: () => void) => {
    programmaticRef.current = true;
    action();
    const reset = () => {
      programmaticRef.current = false;
    };
    map.once("moveend", reset);
    window.setTimeout(reset, 1000);
  };

  // First load: frame the visitor’s metro (IP, or GPS if already granted) —
  // never fitBounds to the full worldwide marker set.
  useEffect(() => {
    if (locationFilter) return;
    if (initialLocalViewAppliedRef.current) return;
    if (userInteractedRef.current) return;

    let cancelled = false;

    const fitLocalBounds = (bounds: {
      south: number;
      north: number;
      west: number;
      east: number;
    }) => {
      if (cancelled || userInteractedRef.current) return;
      initialLocalViewAppliedRef.current = true;
      runProgrammatic(() =>
        map.fitBounds(
          L.latLngBounds(
            [bounds.south, bounds.west],
            [bounds.north, bounds.east],
          ),
          { padding: [48, 48], maxZoom: 11 },
        ),
      );
    };

    map.whenReady(() => {
      if (cancelled || userInteractedRef.current) return;

      const stored = loadStoredNearBounds();
      if (stored) {
        fitLocalBounds(stored);
        return;
      }

      void resolveNearBoundsForLabeling().then((resolved) => {
        if (cancelled || userInteractedRef.current || locationFilter) return;
        if (!resolved) {
          // Geo unavailable — keep the US default; do not zoom to the world.
          initialLocalViewAppliedRef.current = true;
          return;
        }
        storeNearBounds(resolved.bounds);
        fitLocalBounds(resolved.bounds);
      });
    });

    return () => {
      cancelled = true;
    };
  }, [map, locationFilter]);

  useEffect(() => {
    if (!locationKey || !locationFilter) {
      lastFittedLocationKeyRef.current = null;
      fittedLocationWithPointsRef.current = false;
      return;
    }

    if (
      suppressRestoredLocationFitRef.current &&
      locationKey === restoredLocationKeyRef.current
    ) {
      lastFittedLocationKeyRef.current = locationKey;
      return;
    }
    suppressRestoredLocationFitRef.current = false;

    const points = places
      .map((p) => toLatLng(p.lat, p.lng))
      .filter((point): point is [number, number] => point !== null);
    const locationChanged = lastFittedLocationKeyRef.current !== locationKey;

    // Same Near You / area: pin-set growth (search-as-map-moves) must not yank
    // the camera back after the user pans.
    if (!locationChanged) {
      if (
        fittedLocationWithPointsRef.current ||
        userInteractedRef.current ||
        points.length === 0
      ) {
        return;
      }
    } else {
      userInteractedRef.current = false;
      fittedLocationWithPointsRef.current = false;
    }

    lastFittedLocationKeyRef.current = locationKey;
    if (points.length > 0) fittedLocationWithPointsRef.current = true;

    let cancelled = false;
    const { bounds } = locationFilter;

    map.whenReady(() => {
      if (cancelled) return;

      if (points.length === 1) {
        runProgrammatic(() => map.setView(points[0], 12));
        return;
      }

      if (points.length > 1) {
        runProgrammatic(() =>
          map.fitBounds(L.latLngBounds(points), {
            padding: [56, 56],
            maxZoom: 13,
          }),
        );
        return;
      }

      runProgrammatic(() =>
        map.fitBounds(
          L.latLngBounds(
            [bounds.south, bounds.west],
            [bounds.north, bounds.east],
          ),
          { padding: [48, 48], maxZoom: 12 },
        ),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [locationKey, locationFilter, map, placesKey, places]);

  return null;
}

function MapMarkerScale() {
  const map = useMap();

  useEffect(() => {
    const applyScale = () => {
      const zoom = map.getZoom();
      const container = map.getContainer();
      container.style.setProperty("--marker-scale", String(getMarkerScale(zoom)));
      container.style.setProperty(
        "--marker-icon-opacity",
        String(getMarkerIconOpacity(zoom)),
      );
    };

    applyScale();
    map.on("zoom", applyScale);
    map.on("zoomend", applyScale);

    return () => {
      map.off("zoom", applyScale);
      map.off("zoomend", applyScale);
    };
  }, [map]);

  return null;
}

function MapClickDismiss({ onDismiss }: { onDismiss: () => void }) {
  useMapEvents({
    click: () => onDismiss(),
  });
  return null;
}

/** Active world copies for the current viewport (lazy ±360° clones). */
function useWorldLngOffsets() {
  const map = useMap();
  const [state, setState] = useState({ offsets: [0], syncOffset: 0 });

  useEffect(() => {
    const sync = () => {
      const bounds = map.getBounds();
      const next = worldLngOffsetsForBounds(bounds.getWest(), bounds.getEast());
      const centerLng = map.getCenter().lng;
      const syncOffset = next.reduce((best, offset) =>
        Math.abs(centerLng - offset) < Math.abs(centerLng - best)
          ? offset
          : best,
      next[0] ?? 0);

      setState((prev) =>
        sameLngOffsets(prev.offsets, next) && prev.syncOffset === syncOffset
          ? prev
          : { offsets: next, syncOffset },
      );
    };

    map.whenReady(sync);
    map.on("moveend", sync);
    map.on("zoomend", sync);

    return () => {
      map.off("moveend", sync);
      map.off("zoomend", sync);
    };
  }, [map]);

  return state;
}

/** Clear explore hover when the place leaves the map container while panning. */
function MapHovercardViewportGuard({ places }: { places: MapPlace[] }) {
  const map = useMap();
  const hoveredId = useExploreStore((s) => s.hoveredId);
  const setHoveredId = useExploreStore((s) => s.setHoveredId);

  useEffect(() => {
    if (!hoveredId) return;

    const place = places.find((p) => p.id === hoveredId);
    if (!place) {
      setHoveredId(null);
      return;
    }

    const placeStillVisible = () => {
      const bounds = map.getBounds();
      const offsets = worldLngOffsetsForBounds(
        bounds.getWest(),
        bounds.getEast(),
      );
      return offsets.some((offset) =>
        isLatLngInMapContainer(map, [place.lat, place.lng + offset]),
      );
    };

    const dismissIfHidden = () => {
      if (!placeStillVisible()) setHoveredId(null);
    };

    dismissIfHidden();
    // moveend only — per-frame checks during drag fight pan smoothness.
    map.on("moveend", dismissIfHidden);
    map.on("zoomend", dismissIfHidden);

    return () => {
      map.off("moveend", dismissIfHidden);
      map.off("zoomend", dismissIfHidden);
    };
  }, [map, hoveredId, places, setHoveredId]);

  return null;
}

function ExploreMapPins({ places }: { places: MapPlace[] }) {
  const hoveredId = useExploreStore((s) => s.hoveredId);
  const { offsets: lngOffsets, syncOffset } = useWorldLngOffsets();

  return (
    <>
      {places.flatMap((place) =>
        lngOffsets.map((lngOffset) => (
          <ExploreMapPinMarker
            key={`${place.id}:${lngOffset}`}
            place={place}
            lngOffset={lngOffset}
            syncPopup={lngOffset === syncOffset}
            isActive={hoveredId === place.id}
          />
        )),
      )}
    </>
  );
}

function MapBoundsSync() {
  const map = useMap();
  const setMapBounds = useExploreStore((s) => s.setMapBounds);
  const setMapView = useExploreStore((s) => s.setMapView);
  const lastKeyRef = useRef<string | null>(null);
  const resizingRef = useRef(false);
  const resizeTimerRef = useRef(0);

  const reportBounds = useCallback(() => {
    if (resizingRef.current) return;

    const bounds = map.getBounds();
    const center = map.getCenter();
    const next = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };
    // Ignore sub-pixel / float noise from layout so list pagination is not churned.
    const key = `${next.south.toFixed(4)}:${next.north.toFixed(4)}:${next.west.toFixed(4)}:${next.east.toFixed(4)}:${map.getZoom().toFixed(2)}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    setMapBounds(next);
    setMapView({
      lat: center.lat,
      lng: center.lng,
      zoom: map.getZoom(),
    });
  }, [map, setMapBounds, setMapView]);

  useEffect(() => {
    const onWindowResize = () => {
      resizingRef.current = true;
      window.clearTimeout(resizeTimerRef.current);
      resizeTimerRef.current = window.setTimeout(() => {
        resizingRef.current = false;
        reportBounds();
      }, MAP_RESIZE_SETTLE_MS);
    };

    map.whenReady(reportBounds);
    map.on("moveend", reportBounds);
    map.on("zoomend", reportBounds);
    window.addEventListener("resize", onWindowResize);

    return () => {
      map.off("moveend", reportBounds);
      map.off("zoomend", reportBounds);
      window.removeEventListener("resize", onWindowResize);
      window.clearTimeout(resizeTimerRef.current);
      lastKeyRef.current = null;
      setMapBounds(null);
    };
  }, [map, reportBounds, setMapBounds]);

  return null;
}

function ExploreMapPinMarker({
  place,
  isActive,
  lngOffset = 0,
  syncPopup = true,
}: {
  place: MapPlace;
  isActive: boolean;
  lngOffset?: number;
  /** Only one world-copy should follow list hover; others open on direct hover. */
  syncPopup?: boolean;
}) {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setHoveredId = useExploreStore((s) => s.setHoveredId);
  const icon = useMemo(
    () => createPlaceMarkerIcon(place, isActive),
    [place, isActive],
  );

  const showPopup = () => {
    cancelHoverClose(hideTimerRef);
    setHoveredId(place.id);
    const marker = markerRef.current;
    if (marker) openMarkerPopupNow(marker);
  };

  const scheduleHide = () => {
    scheduleHoverClose(hideTimerRef, () => {
      if (useExploreStore.getState().hoveredId !== place.id) return;
      setHoveredId(null);
      markerRef.current?.closePopup();
    });
  };

  useEffect(() => {
    if (!syncPopup) return;
    if (!isActive) {
      markerRef.current?.closePopup();
      return;
    }

    const marker = markerRef.current;
    if (!marker || marker.isPopupOpen()) return;

    return openMarkerPopupWhenReady(map, marker);
  }, [isActive, map, syncPopup]);

  useEffect(() => () => cancelHoverClose(hideTimerRef), []);

  return (
    <Marker
      ref={markerRef}
      position={[place.lat, place.lng + lngOffset]}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
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
        <MapPopoverCard place={place} />
      </Popup>
    </Marker>
  );
}

/** Prefer restored view, then stored near-you metro, then US overview. */
function resolveInitialMapCamera(): {
  center: [number, number];
  zoom: number;
} {
  const restored = useExploreStore.getState().mapView;
  if (restored) {
    return { center: [restored.lat, restored.lng], zoom: restored.zoom };
  }

  const near = loadStoredNearBounds();
  if (near) {
    const latSpan = Math.max(0.01, near.north - near.south);
    // Rough zoom from span — keeps first bounds report metro-scale.
    const zoom = latSpan > 4 ? 7 : latSpan > 1.5 ? 9 : 10;
    return {
      center: [(near.north + near.south) / 2, (near.east + near.west) / 2],
      zoom,
    };
  }

  return { center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM };
}

export function PlaceMap({ places }: PlaceMapProps) {
  const setHoveredId = useExploreStore((s) => s.setHoveredId);
  const initialCamera = useRef(resolveInitialMapCamera()).current;

  const validPlaces = useMemo(
    () => places.filter((p) => placeShowsMapPin(p) && isValidCoord(p.lat, p.lng)),
    [places],
  );

  const useCluster = validPlaces.length > 80;

  return (
    <MapContainer
      key="place-map"
      center={initialCamera.center}
      zoom={initialCamera.zoom}
      minZoom={MIN_ZOOM}
      className="h-full min-h-[320px] w-full"
      scrollWheelZoom
      closePopupOnClick={false}
      // Per-frame invalidateSize during window drag locks the main thread with
      // thousands of clustered markers. We settle-resize in MapResizeSettle.
      trackResize={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapPopupPaneHost />
      <MapMarkerScale />
      <MapResizeSettle />
      <MapBoundsSync />
      <MapVerticalPanClamp />
      <MapAutoControl places={validPlaces} />
      <MapHovercardViewportGuard places={validPlaces} />
      <MapClickDismiss onDismiss={() => setHoveredId(null)} />
      {useCluster ? (
        <PlaceMarkerCluster places={validPlaces} />
      ) : (
        <ExploreMapPins places={validPlaces} />
      )}
    </MapContainer>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
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
  cancelHoverClose,
  isLatLngInMapContainer,
  MAP_HOVER_POPUP_OPTIONS,
  openMarkerPopupNow,
  openMarkerPopupWhenReady,
  scheduleHoverClose,
} from "@/lib/map-popup";
import { isValidCoord, toLatLng, WORLD_LNG_OFFSETS } from "@/lib/coords";
import { placeShowsMapPin } from "@/lib/place-location";
import {
  loadStoredNearBounds,
  resolveNearBoundsForLabeling,
  storeNearBounds,
} from "@/lib/user-location";
import { useExploreStore } from "@/store/explore-store";
import type { PlaceMarker } from "@/types/place";

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;
/** Floor for zoom-out; vertical pan clamp + world marker copies cover the rest. */
const MIN_ZOOM = 2.5;
/** Web Mercator world edge — matches Leaflet’s SphericalMercator.MAX_LATITUDE. */
const WORLD_MAX_LAT = 85.0511287798;

interface PlaceMapProps {
  places: PlaceMarker[];
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
    map.on("move", clamp);
    map.on("zoom", clamp);
    map.on("resize", clamp);

    return () => {
      map.off("move", clamp);
      map.off("zoom", clamp);
      map.off("resize", clamp);
      container.style.removeProperty("--map-world-top");
    };
  }, [map]);

  return null;
}

function MapAutoControl({ places }: { places: PlaceMarker[] }) {
  const map = useMap();
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const userInteractedRef = useRef(false);
  const programmaticRef = useRef(false);
  const lastLocationKeyRef = useRef<string | null>(null);
  // After refresh, keep the restored viewport instead of re-fitting near-you / location.
  const restoredMapView = useRef(useExploreStore.getState().mapView).current;
  const initialLocalViewAppliedRef = useRef(restoredMapView != null);
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
      lastLocationKeyRef.current = null;
      return;
    }

    // Refit when the location changes or when matches for that location arrive.
    const fitKey = `${locationKey}:${placesKey}`;
    if (lastLocationKeyRef.current === fitKey) return;

    if (
      suppressRestoredLocationFitRef.current &&
      locationKey === restoredLocationKeyRef.current
    ) {
      lastLocationKeyRef.current = fitKey;
      return;
    }
    suppressRestoredLocationFitRef.current = false;

    lastLocationKeyRef.current = fitKey;

    userInteractedRef.current = false;
    let cancelled = false;
    const { bounds } = locationFilter;
    const points = places
      .map((p) => toLatLng(p.lat, p.lng))
      .filter((point): point is [number, number] => point !== null);

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

/** Clear explore hover when the place leaves the map container while panning. */
function MapHovercardViewportGuard({ places }: { places: PlaceMarker[] }) {
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

    const placeStillVisible = () =>
      WORLD_LNG_OFFSETS.some((offset) =>
        isLatLngInMapContainer(map, [place.lat, place.lng + offset]),
      );

    const dismissIfHidden = () => {
      if (!placeStillVisible()) setHoveredId(null);
    };

    dismissIfHidden();
    map.on("move", dismissIfHidden);
    map.on("zoom", dismissIfHidden);

    return () => {
      map.off("move", dismissIfHidden);
      map.off("zoom", dismissIfHidden);
    };
  }, [map, hoveredId, places, setHoveredId]);

  return null;
}

function MapBoundsSync() {
  const map = useMap();
  const setMapBounds = useExploreStore((s) => s.setMapBounds);
  const setMapView = useExploreStore((s) => s.setMapView);
  const lastKeyRef = useRef<string | null>(null);

  const reportBounds = useCallback(() => {
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
    map.whenReady(reportBounds);
    map.on("moveend", reportBounds);
    map.on("zoomend", reportBounds);

    return () => {
      map.off("moveend", reportBounds);
      map.off("zoomend", reportBounds);
      lastKeyRef.current = null;
      setMapBounds(null);
    };
  }, [map, reportBounds, setMapBounds]);

  return null;
}

function ExploreMapPin({
  place,
  isActive,
  lngOffset = 0,
  syncPopup = true,
}: {
  place: PlaceMarker;
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

export function PlaceMap({ places }: PlaceMapProps) {
  const hoveredId = useExploreStore((s) => s.hoveredId);
  const setHoveredId = useExploreStore((s) => s.setHoveredId);
  const initialMapView = useRef(useExploreStore.getState().mapView).current;

  const validPlaces = useMemo(
    () => places.filter((p) => placeShowsMapPin(p) && isValidCoord(p.lat, p.lng)),
    [places],
  );

  const useCluster = validPlaces.length > 80;

  return (
    <MapContainer
      key="place-map"
      center={
        initialMapView
          ? [initialMapView.lat, initialMapView.lng]
          : DEFAULT_CENTER
      }
      zoom={initialMapView?.zoom ?? DEFAULT_ZOOM}
      minZoom={MIN_ZOOM}
      className="h-full min-h-[320px] w-full"
      scrollWheelZoom
      closePopupOnClick={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapPopupPaneHost />
      <MapMarkerScale />
      <MapBoundsSync />
      <MapVerticalPanClamp />
      <MapAutoControl places={validPlaces} />
      <MapHovercardViewportGuard places={validPlaces} />
      <MapClickDismiss onDismiss={() => setHoveredId(null)} />
      {useCluster ? (
        <PlaceMarkerCluster places={validPlaces} />
      ) : (
        validPlaces.flatMap((place) =>
          WORLD_LNG_OFFSETS.map((lngOffset) => (
            <ExploreMapPin
              key={`${place.id}:${lngOffset}`}
              place={place}
              lngOffset={lngOffset}
              syncPopup={lngOffset === 0}
              isActive={hoveredId === place.id}
            />
          )),
        )
      )}
    </MapContainer>
  );
}

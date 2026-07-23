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
  getMarkerPopupOffset,
  getMarkerScale,
} from "@/lib/map-markers";
import {
  cancelHoverClose,
  openMarkerPopupNow,
  openMarkerPopupWhenReady,
  scheduleHoverClose,
} from "@/lib/map-popup";
import { isValidCoord, toLatLng } from "@/lib/coords";
import { placeShowsMapPin } from "@/lib/place-location";
import { useExploreStore } from "@/store/explore-store";
import type { PlaceMarker } from "@/types/place";

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;

interface PlaceMapProps {
  places: PlaceMarker[];
}

function MapAutoControl({ places }: { places: PlaceMarker[] }) {
  const map = useMap();
  const locationFilter = useExploreStore((s) => s.locationFilter);
  const userInteractedRef = useRef(false);
  const programmaticRef = useRef(false);
  const lastLocationKeyRef = useRef<string | null>(null);

  const placesKey = useMemo(() => places.map((p) => p.id).join(","), [places]);
  const locationKey = locationFilter
    ? `${locationFilter.label}:${locationFilter.bounds.south}:${locationFilter.bounds.north}:${locationFilter.bounds.west}:${locationFilter.bounds.east}`
    : null;

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

  useEffect(() => {
    if (!locationKey || !locationFilter) {
      lastLocationKeyRef.current = null;
      return;
    }

    // Refit when the location changes or when matches for that location arrive.
    const fitKey = `${locationKey}:${placesKey}`;
    if (lastLocationKeyRef.current === fitKey) return;
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

  useEffect(() => {
    if (locationFilter) return;
    if (userInteractedRef.current) return;

    if (places.length === 0) {
      let cancelled = false;

      map.whenReady(() => {
        if (cancelled || userInteractedRef.current) return;
        runProgrammatic(() => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM));
      });

      return () => {
        cancelled = true;
      };
    }

    const points = places
      .map((p) => toLatLng(p.lat, p.lng))
      .filter((point): point is [number, number] => point !== null);

    if (points.length === 0) return;

    let cancelled = false;

    map.whenReady(() => {
      if (cancelled || userInteractedRef.current) return;

      if (points.length === 1) {
        runProgrammatic(() => map.setView(points[0], 10));
        return;
      }
      runProgrammatic(() =>
        map.fitBounds(L.latLngBounds(points), {
          padding: [48, 48],
          maxZoom: 10,
        }),
      );
    });

    return () => {
      cancelled = true;
    };
  }, [placesKey, map, places.length, locationFilter]);

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

function MapBoundsSync() {
  const map = useMap();
  const setMapBounds = useExploreStore((s) => s.setMapBounds);
  const lastKeyRef = useRef<string | null>(null);

  const reportBounds = useCallback(() => {
    const bounds = map.getBounds();
    const next = {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    };
    // Ignore sub-pixel / float noise from layout so list pagination is not churned.
    const key = `${next.south.toFixed(4)}:${next.north.toFixed(4)}:${next.west.toFixed(4)}:${next.east.toFixed(4)}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    setMapBounds(next);
  }, [map, setMapBounds]);

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
}: {
  place: PlaceMarker;
  isActive: boolean;
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
    if (!isActive) {
      markerRef.current?.closePopup();
      return;
    }

    const marker = markerRef.current;
    if (!marker || marker.isPopupOpen()) return;

    return openMarkerPopupWhenReady(map, marker);
  }, [isActive, map]);

  useEffect(() => () => cancelHoverClose(hideTimerRef), []);

  return (
    <Marker
      ref={markerRef}
      position={[place.lat, place.lng]}
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
        closeButton={false}
        autoPan={false}
        offset={getMarkerPopupOffset()}
        className="map-place-popup"
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

  const validPlaces = useMemo(
    () => places.filter((p) => placeShowsMapPin(p) && isValidCoord(p.lat, p.lng)),
    [places],
  );

  const useCluster = validPlaces.length > 80;

  return (
    <MapContainer
      key="place-map"
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
      <MapMarkerScale />
      <MapBoundsSync />
      <MapAutoControl places={validPlaces} />
      <MapClickDismiss onDismiss={() => setHoveredId(null)} />
      {useCluster ? (
        <PlaceMarkerCluster places={validPlaces} />
      ) : (
        validPlaces.map((place) => (
          <ExploreMapPin
            key={place.id}
            place={place}
            isActive={hoveredId === place.id}
          />
        ))
      )}
    </MapContainer>
  );
}

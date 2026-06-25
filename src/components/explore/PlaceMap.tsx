"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
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
import { createPlaceMarkerIcon } from "@/lib/map-markers";
import { useExploreStore } from "@/store/explore-store";
import type { Place } from "@/types/place";

const DEFAULT_CENTER: [number, number] = [39.8283, -98.5795];
const DEFAULT_ZOOM = 4;

interface PlaceMapProps {
  places: Place[];
}

function isValidCoord(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng);
}

function MapAutoControl({
  places,
  hoveredId,
}: {
  places: Place[];
  hoveredId: string | null;
}) {
  const map = useMap();
  const userInteractedRef = useRef(false);
  const programmaticRef = useRef(false);

  const placesKey = useMemo(() => places.map((p) => p.id).join(","), [places]);

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
    if (userInteractedRef.current) return;

    if (places.length === 0) {
      map.whenReady(() => {
        runProgrammatic(() => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM));
      });
      return;
    }

    const points = places
      .filter((p) => isValidCoord(p.lat, p.lng))
      .map((p) => [p.lat, p.lng] as [number, number]);

    if (points.length === 0) return;

    map.whenReady(() => {
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
  }, [placesKey, map, places.length]);

  useEffect(() => {
    if (userInteractedRef.current || !hoveredId) return;

    const place = places.find((p) => p.id === hoveredId);
    if (!place || !isValidCoord(place.lat, place.lng)) return;

    map.whenReady(() => {
      if (!isValidCoord(place.lat, place.lng)) return;
      const zoom = map.getZoom();
      const targetZoom = Number.isFinite(zoom) ? Math.max(zoom, 10) : 10;
      runProgrammatic(() =>
        map.flyTo([place.lat, place.lng], targetZoom, { duration: 0.8 }),
      );
    });
  }, [hoveredId, places, map]);

  return null;
}

function MapClickDismiss({ onDismiss }: { onDismiss: () => void }) {
  useMapEvents({
    click: () => onDismiss(),
  });
  return null;
}

function PlaceMarker({
  place,
  isActive,
  pinnedId,
  onPin,
  onViewDetails,
}: {
  place: Place;
  isActive: boolean;
  pinnedId: string | null;
  onPin: () => void;
  onViewDetails: () => void;
}) {
  const markerRef = useRef<L.Marker>(null);
  const setHoveredId = useExploreStore((s) => s.setHoveredId);
  const icon = useMemo(
    () => createPlaceMarkerIcon(place, isActive),
    [place, isActive],
  );

  useEffect(() => {
    if (isActive) {
      markerRef.current?.openPopup();
    } else {
      markerRef.current?.closePopup();
    }
  }, [isActive]);

  return (
    <Marker
      ref={markerRef}
      position={[place.lat, place.lng]}
      icon={icon}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          onPin();
        },
        mouseover: () => setHoveredId(place.id),
        mouseout: () => {
          if (pinnedId !== place.id) {
            setHoveredId(null);
          }
        },
      }}
    >
      <Popup
        closeButton={false}
        autoPan
        offset={[0, -4]}
        className="map-place-popup"
        eventHandlers={{
          mouseover: () => setHoveredId(place.id),
          mouseout: () => {
            if (pinnedId !== place.id) {
              setHoveredId(null);
            }
          },
        }}
      >
        <MapPopoverCard place={place} onViewDetails={onViewDetails} />
      </Popup>
    </Marker>
  );
}

export function PlaceMap({ places }: PlaceMapProps) {
  const router = useRouter();
  const hoveredId = useExploreStore((s) => s.hoveredId);
  const pinnedPopupId = useExploreStore((s) => s.pinnedPopupId);
  const setPinnedPopupId = useExploreStore((s) => s.setPinnedPopupId);
  const setHoveredId = useExploreStore((s) => s.setHoveredId);

  const validPlaces = useMemo(
    () => places.filter((p) => isValidCoord(p.lat, p.lng)),
    [places],
  );

  const activePopoverId = pinnedPopupId ?? hoveredId;

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
      <MapAutoControl places={validPlaces} hoveredId={hoveredId} />
      <MapClickDismiss
        onDismiss={() => {
          setPinnedPopupId(null);
          setHoveredId(null);
        }}
      />
      {validPlaces.map((place) => (
        <PlaceMarker
          key={place.id}
          place={place}
          isActive={activePopoverId === place.id}
          pinnedId={pinnedPopupId}
          onPin={() => setPinnedPopupId(place.id)}
          onViewDetails={() => router.push(`/place/${place.id}`)}
        />
      ))}
    </MapContainer>
  );
}

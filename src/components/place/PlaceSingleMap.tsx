"use client";

import { useEffect, useMemo, useState } from "react";
import { Compass } from "@phosphor-icons/react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { createPlaceMarkerIcon } from "@/lib/map-markers";
import type { Place } from "@/types/place";

interface PlaceSingleMapProps {
  place: Place;
  directionsUrl?: string | null;
}

export function PlaceSingleMap({
  place,
  directionsUrl = null,
}: PlaceSingleMapProps) {
  // Leaflet mutates the DOM container; only mount after client paint and tear
  // down on unmount so React Strict Mode / HMR don't hit a stale map instance.
  const [mounted, setMounted] = useState(false);
  const icon = useMemo(
    () => createPlaceMarkerIcon(place, true),
    [place.tradition, place.type],
  );

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return (
      <div
        className="map-embedded h-[320px] overflow-hidden rounded-2xl border border-border bg-surface-muted"
        aria-hidden
      />
    );
  }

  return (
    <div className="map-embedded relative overflow-hidden rounded-2xl border border-border">
      <MapContainer
        key={place.id}
        center={[place.lat, place.lng]}
        zoom={13}
        className="h-[320px] w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[place.lat, place.lng]} icon={icon} />
      </MapContainer>
      {directionsUrl ? (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 left-3 z-10 inline-flex items-center gap-2 rounded-xl bg-brand px-3.5 py-2.5 text-sm font-semibold text-brand-foreground shadow-[var(--shadow-float)] transition hover:bg-brand-hover"
        >
          <Compass size={16} weight="bold" />
          Get directions
        </a>
      ) : null}
    </div>
  );
}

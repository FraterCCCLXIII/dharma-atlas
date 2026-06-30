"use client";

import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { createPlaceMarkerIcon } from "@/lib/map-markers";
import type { Place } from "@/types/place";

interface PlaceSingleMapProps {
  place: Place;
}

export function PlaceSingleMap({ place }: PlaceSingleMapProps) {
  const icon = createPlaceMarkerIcon(place, true);

  return (
    <div className="map-embedded overflow-hidden rounded-2xl border border-border">
      <MapContainer
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
    </div>
  );
}

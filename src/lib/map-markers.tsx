import {
  Buildings,
  FlowerLotus,
  GraduationCap,
  House,
  Mountains,
  TreeEvergreen,
} from "@phosphor-icons/react";
import L from "leaflet";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Icon } from "@phosphor-icons/react";
import type { Place, PlaceType } from "@/types/place";
import { traditionMarkerColor } from "@/lib/places";

const FULL_MARKER_ZOOM = 12;
const DOT_MARKER_ZOOM = 5;
const MIN_MARKER_SCALE = 0.32;

export function getMarkerScale(zoom: number): number {
  if (zoom >= FULL_MARKER_ZOOM) return 1;
  if (zoom <= DOT_MARKER_ZOOM) return MIN_MARKER_SCALE;
  const t = (zoom - DOT_MARKER_ZOOM) / (FULL_MARKER_ZOOM - DOT_MARKER_ZOOM);
  return MIN_MARKER_SCALE + t * (1 - MIN_MARKER_SCALE);
}

/** Fades type icons out at low zoom so markers read as simple colored dots. */
export function getMarkerIconOpacity(zoom: number): number {
  if (zoom >= 10) return 1;
  if (zoom <= 7) return 0;
  return (zoom - 7) / 3;
}

const TYPE_ICONS: Record<PlaceType, Icon> = {
  Center: Buildings,
  Temple: House,
  Monastery: Mountains,
  "Meditation Center": FlowerLotus,
  Institute: GraduationCap,
  Ashram: TreeEvergreen,
};

export function createPlaceMarkerIcon(place: Place, active: boolean): L.DivIcon {
  const Icon = TYPE_ICONS[place.type] ?? Buildings;
  const color = traditionMarkerColor(place.tradition);

  const html = renderToStaticMarkup(
    createElement(
      "div",
      { className: `map-marker${active ? " map-marker--active" : ""}` },
      createElement(
        "div",
        {
          className: "map-marker__circle",
          style: { backgroundColor: color, color },
        },
        createElement(Icon, {
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
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  });
}

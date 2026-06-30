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

/** Popup offset — Leaflet's default margin-bottom handles tip spacing. */
export function getMarkerPopupOffset(_zoom?: number): [number, number] {
  return [0, 0];
}

const TYPE_ICONS: Record<PlaceType, Icon> = {
  Center: Buildings,
  Temple: House,
  Monastery: Mountains,
  "Meditation Center": FlowerLotus,
  Institute: GraduationCap,
  Ashram: TreeEvergreen,
};

export function createPlaceMarkerIcon(
  place: Place,
  active: boolean,
  options?: { stackCount?: number },
): L.DivIcon {
  const Icon = TYPE_ICONS[place.type] ?? Buildings;
  const color = traditionMarkerColor(place.tradition);
  const stackCount = options?.stackCount ?? 0;
  const showStackCount = stackCount > 1;

  const html = renderToStaticMarkup(
    createElement(
      "div",
      {
        className: `map-marker${active ? " map-marker--active" : ""}${showStackCount ? " map-marker--stack" : ""}`,
      },
      createElement(
        "div",
        {
          className: "map-marker__circle",
          style: { backgroundColor: color, color },
        },
        showStackCount
          ? createElement(
              "span",
              { className: "map-marker__count" },
              stackCount > 99 ? "99+" : String(stackCount),
            )
          : createElement(Icon, {
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

/** Leaflet.markercluster default density colors (green → yellow → orange). */
function clusterColors(count: number) {
  if (count >= 100) {
    return { outer: "rgba(253, 156, 115, 0.6)", inner: "rgba(241, 128, 23, 0.85)" };
  }
  if (count >= 10) {
    return { outer: "rgba(241, 211, 87, 0.6)", inner: "rgba(240, 194, 12, 0.85)" };
  }
  return { outer: "rgba(181, 226, 140, 0.6)", inner: "rgba(110, 204, 57, 0.85)" };
}

export function createMapClusterIcon(count: number): L.DivIcon {
  const { outer, inner } = clusterColors(count);
  const label = count > 999 ? "999+" : String(count);

  const html = `<div class="map-cluster" style="background-color:${outer}"><div class="map-cluster__inner" style="background-color:${inner};color:#fff"><span>${label}</span></div></div>`;

  return L.divIcon({
    className: "map-cluster-wrap",
    html,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

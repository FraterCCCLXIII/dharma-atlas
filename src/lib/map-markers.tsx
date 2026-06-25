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

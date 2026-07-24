"use client";

import { useLayoutEffect } from "react";
import type L from "leaflet";
import { useMap } from "react-leaflet";
import {
  isLatLngInMapContainer,
  MAP_HOVER_POPUP_PANE,
} from "@/lib/map-popup";

type MapWithOpenPopup = L.Map & { _popup?: L.Popup | null };

/**
 * Hosts Leaflet popups on `[data-map-shell]` (sibling of the overflow-clipped
 * map panel) and mirrors the map pane transform so cards stay anchored to
 * markers without being cut off by the rounded map container.
 *
 * Pane geometry must match Leaflet's default panes (`left/top: 0`, no sized
 * box). Using `inset: 0` breaks popup `bottom` positioning and hides cards.
 *
 * Because the pane is outside the clipped map chrome, popups can otherwise
 * drift over neighboring columns when the marker pans off-screen — close them
 * as soon as their anchor leaves the map container.
 */
export function MapPopupPaneHost() {
  const map = useMap();

  useLayoutEffect(() => {
    const shell = map
      .getContainer()
      .closest("[data-map-shell]") as HTMLElement | null;
    const mapPane = map.getPane("mapPane");
    if (!shell || !mapPane) return;

    let pane = map.getPane(MAP_HOVER_POPUP_PANE);
    if (!pane) {
      pane = map.createPane(MAP_HOVER_POPUP_PANE, shell);
    } else if (pane.parentElement !== shell) {
      shell.appendChild(pane);
    }

    pane.classList.add("map-hover-popup-pane");
    // Match `.leaflet-pane` — position from origin, size from content/transform.
    // Above `.map-panel` (z-0 stacking context) so cards clear zoom + map chrome.
    pane.style.zIndex = "20";
    pane.style.position = "absolute";
    pane.style.left = "0";
    pane.style.top = "0";
    pane.style.right = "auto";
    pane.style.bottom = "auto";
    pane.style.width = "auto";
    pane.style.height = "auto";
    pane.style.overflow = "visible";
    pane.style.pointerEvents = "none";

    const syncTransform = () => {
      pane!.style.transform = mapPane.style.transform;
      pane!.style.transformOrigin = mapPane.style.transformOrigin || "0 0";
    };

    const dismissOffscreenPopup = () => {
      const openPopup = (map as MapWithOpenPopup)._popup;
      if (!openPopup?.isOpen()) return;
      const latlng = openPopup.getLatLng();
      if (!latlng) return;
      if (!isLatLngInMapContainer(map, latlng)) {
        map.closePopup(openPopup);
      }
    };

    const onMoveOrZoom = () => {
      syncTransform();
      dismissOffscreenPopup();
    };

    syncTransform();
    map.on("move", onMoveOrZoom);
    map.on("zoom", onMoveOrZoom);
    map.on("viewreset", syncTransform);
    map.on("zoomanim", syncTransform);

    return () => {
      map.off("move", onMoveOrZoom);
      map.off("zoom", onMoveOrZoom);
      map.off("viewreset", syncTransform);
      map.off("zoomanim", syncTransform);
    };
  }, [map]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Settle window / container resizes before invalidateSize — per-frame work freezes maps. */
export const MAP_RESIZE_SETTLE_MS = 160;

/**
 * Owns Leaflet size sync when `trackResize` is off on MapContainer.
 * Without this, shell flex changes leave the map at a stale pixel width (right gap).
 */
export function MapResizeSettle() {
  const map = useMap();

  useEffect(() => {
    let timer = 0;
    const settle = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        map.invalidateSize({ debounceMoveend: true, animate: false });
      }, MAP_RESIZE_SETTLE_MS);
    };

    settle();
    window.addEventListener("resize", settle);
    const observer = new ResizeObserver(settle);
    observer.observe(map.getContainer());

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", settle);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

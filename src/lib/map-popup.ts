import type { Root } from "react-dom/client";
import type { ReactNode } from "react";
import type L from "leaflet";
import { getMarkerPopupOffset } from "@/lib/map-markers";

/** Pane hosted on `[data-map-shell]` so hovercards can clear the map chrome. */
export const MAP_HOVER_POPUP_PANE = "hoverCardPane";

/** Shared Leaflet popup options for map hovercards. */
export const MAP_HOVER_POPUP_OPTIONS = {
  closeButton: false,
  autoPan: false,
  offset: getMarkerPopupOffset(),
  className: "map-place-popup",
  pane: MAP_HOVER_POPUP_PANE,
} as const;

function isMapAnimating(map: L.Map): boolean {
  const internal = map as L.Map & {
    _animatingZoom?: boolean;
    _panAnim?: { _inProgress?: boolean };
  };
  return Boolean(internal._animatingZoom || internal._panAnim?._inProgress);
}

export const MAP_HOVER_CLOSE_MS = 150;

/** True when the lat/lng projects inside the map container’s pixel box. */
export function isLatLngInMapContainer(
  map: L.Map,
  latlng: L.LatLngExpression,
): boolean {
  const point = map.latLngToContainerPoint(latlng);
  const size = map.getSize();
  return point.x >= 0 && point.y >= 0 && point.x <= size.x && point.y <= size.y;
}

export function cancelHoverClose(
  timerRef: { current: ReturnType<typeof setTimeout> | null },
) {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

export function scheduleHoverClose(
  timerRef: { current: ReturnType<typeof setTimeout> | null },
  onClose: () => void,
) {
  cancelHoverClose(timerRef);
  timerRef.current = setTimeout(() => {
    timerRef.current = null;
    onClose();
  }, MAP_HOVER_CLOSE_MS);
}

/** Re-measure popup position after content paints at full height. */
export function refreshPopupLayout(popup: L.Popup | undefined | null) {
  if (!popup?.isOpen()) return;
  popup.update();
  requestAnimationFrame(() => popup.update());
}

/** Open popup immediately — use when the pointer is already on the marker. */
export function openMarkerPopupNow(
  marker: L.Marker,
  beforeOpen?: () => void,
) {
  beforeOpen?.();
  marker.openPopup();
  refreshPopupLayout(marker.getPopup());
}

/** Render popup React content, then refresh Leaflet layout after paint. */
export function renderPopupRoot(
  root: Root,
  node: ReactNode,
  onRendered?: () => void,
) {
  root.render(node);
  if (!onRendered) return;

  queueMicrotask(() => {
    requestAnimationFrame(onRendered);
  });
}

/** Unmount a popup root outside the current React render to avoid race errors. */
export function unmountPopupRoot(root: Root | undefined) {
  if (!root) return;

  setTimeout(() => {
    try {
      root.unmount();
    } catch {
      // Root may already be unmounted if cleanup runs more than once.
    }
  }, 0);
}

/**
 * Open a marker popup after any in-flight map animation finishes so the
 * card is not clipped while flyTo / autoPan is still running.
 */
export function openMarkerPopupWhenReady(
  map: L.Map,
  marker: L.Marker,
  beforeOpen?: () => void,
): () => void {
  let cancelled = false;

  const open = () => {
    if (cancelled) return;
    beforeOpen?.();
    marker.openPopup();
    refreshPopupLayout(marker.getPopup());
  };

  const scheduleOpen = () => {
    if (isMapAnimating(map)) {
      map.once("moveend", open);
      return;
    }

    // Defer one frame so a flyTo kicked off in the same React commit can start first.
    requestAnimationFrame(() => {
      if (cancelled) return;
      if (isMapAnimating(map)) {
        map.once("moveend", open);
      } else {
        open();
      }
    });
  };

  scheduleOpen();

  return () => {
    cancelled = true;
    map.off("moveend", open);
  };
}

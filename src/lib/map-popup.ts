import { flushSync } from "react-dom";
import type { Root } from "react-dom/client";
import type { ReactNode } from "react";
import type L from "leaflet";

function isMapAnimating(map: L.Map): boolean {
  const internal = map as L.Map & {
    _animatingZoom?: boolean;
    _panAnim?: { _inProgress?: boolean };
  };
  return Boolean(internal._animatingZoom || internal._panAnim?._inProgress);
}

export const MAP_HOVER_CLOSE_MS = 150;

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

/** Render popup React content synchronously so Leaflet measures the full card. */
export function renderPopupRoot(root: Root, node: ReactNode) {
  flushSync(() => {
    root.render(node);
  });
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

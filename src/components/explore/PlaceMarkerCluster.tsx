"use client";

import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useRouter } from "next/navigation";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useMap } from "react-leaflet";
import { MapPopoverCard } from "@/components/explore/MapPopoverCard";
import {
  createMapClusterIcon,
  createPlaceMarkerIcon,
  getMarkerPopupOffset,
} from "@/lib/map-markers";
import {
  cancelHoverClose,
  openMarkerPopupNow,
  openMarkerPopupWhenReady,
  refreshPopupLayout,
  renderPopupRoot,
  scheduleHoverClose,
  unmountPopupRoot,
} from "@/lib/map-popup";
import { useExploreStore } from "@/store/explore-store";
import type { Place } from "@/types/place";

function coordKey(lat: number, lng: number) {
  return `${lat.toFixed(6)}:${lng.toFixed(6)}`;
}

/** Merge places that share identical coordinates (stacked_coords in the DB). */
function groupPlacesByCoord(places: Place[]) {
  const groups = new Map<string, Place[]>();
  for (const place of places) {
    const key = coordKey(place.lat, place.lng);
    const list = groups.get(key) ?? [];
    list.push(place);
    groups.set(key, list);
  }
  return groups;
}

type MarkerClusterGroup = L.LayerGroup & {
  addLayer: (layer: L.Layer) => MarkerClusterGroup;
};

function markerIsVisible(marker: L.Marker): boolean {
  return Boolean((marker as L.Marker & { _icon?: unknown })._icon);
}

type FloatingPopupRefs = {
  popup: L.Popup | null;
  container: HTMLDivElement | null;
  root: Root | null;
};

function closeFloatingPopup(map: L.Map, refs: FloatingPopupRefs) {
  unmountPopupRoot(refs.root ?? undefined);
  refs.root = null;
  refs.container = null;
  if (refs.popup) {
    map.closePopup(refs.popup);
  }
}

function showFloatingPopup(
  map: L.Map,
  refs: FloatingPopupRefs,
  place: Place,
  onViewDetails: () => void,
) {
  if (!refs.container) {
    refs.container = document.createElement("div");
    refs.root = createRoot(refs.container);
  }
  if (!refs.popup) {
    refs.popup = L.popup({
      closeButton: false,
      autoPan: false,
      offset: getMarkerPopupOffset(),
      className: "map-place-popup",
    });
  }

  renderPopupRoot(
    refs.root!,
    <MapPopoverCard place={place} onViewDetails={onViewDetails} />,
    () => refreshPopupLayout(refs.popup ?? undefined),
  );

  refs.popup
    .setLatLng([place.lat, place.lng])
    .setContent(refs.container)
    .openOn(map);
}

type ClusterMarker = L.Marker & {
  __placeGroup?: Place[];
  __popupContainer?: HTMLDivElement;
  __popupRoot?: Root;
};

function mountPopoverCard(
  marker: ClusterMarker,
  place: Place,
  onViewDetails: () => void,
) {
  if (!marker.__popupContainer) {
    marker.__popupContainer = document.createElement("div");
    marker.__popupRoot = createRoot(marker.__popupContainer);
    marker.setPopupContent(marker.__popupContainer);
  }

  renderPopupRoot(
    marker.__popupRoot!,
    <MapPopoverCard place={place} onViewDetails={onViewDetails} />,
    () => refreshPopupLayout(marker.getPopup()),
  );
}

export function PlaceMarkerCluster({ places }: { places: Place[] }) {
  const map = useMap();
  const router = useRouter();
  const hoveredId = useExploreStore((s) => s.hoveredId);
  const setHoveredId = useExploreStore((s) => s.setHoveredId);

  const markerByPlaceIdRef = useRef<Map<string, ClusterMarker>>(new Map());
  const clusterRef = useRef<MarkerClusterGroup | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelOpenRef = useRef<(() => void) | null>(null);
  const openGenRef = useRef(0);
  const floatingPopupRef = useRef<FloatingPopupRefs>({
    popup: null,
    container: null,
    root: null,
  });

  useEffect(() => {
    const cluster = (
      L as typeof L & {
        markerClusterGroup: (options?: object) => MarkerClusterGroup;
      }
    ).markerClusterGroup({
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 56,
      disableClusteringAtZoom: 14,
      iconCreateFunction: (cluster: { getChildCount: () => number }) =>
        createMapClusterIcon(cluster.getChildCount()),
    });

    clusterRef.current = cluster;

    const groups = groupPlacesByCoord(places);
    const markerByPlaceId = new Map<string, ClusterMarker>();

    for (const [, group] of groups) {
      const representative = group[0];
      const marker = L.marker([representative.lat, representative.lng], {
        icon: createPlaceMarkerIcon(representative, false, {
          stackCount: group.length,
        }),
      }) as ClusterMarker;

      marker.__placeGroup = group;

      marker.bindPopup(document.createElement("div"), {
        closeButton: false,
        autoPan: false,
        offset: getMarkerPopupOffset(),
        className: "map-place-popup",
      });

      mountPopoverCard(marker, representative, () =>
        router.push(`/place/${representative.id}`),
      );

      for (const place of group) {
        markerByPlaceId.set(place.id, marker);
      }

      const showPopup = (place: Place) => {
        cancelHoverClose(hideTimerRef);
        setHoveredId(place.id);

        const open = () =>
          openMarkerPopupNow(marker, () =>
            mountPopoverCard(marker, place, () =>
              router.push(`/place/${place.id}`),
            ),
          );

        if (markerIsVisible(marker)) {
          open();
        }
      };

      const scheduleHide = () => {
        scheduleHoverClose(hideTimerRef, () => {
          const currentHover = useExploreStore.getState().hoveredId;
          if (!group.some((p) => p.id === currentHover)) return;
          setHoveredId(null);
          marker.closePopup();
        });
      };

      marker.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        showPopup(representative);
      });

      marker.on("mouseover", () => {
        const currentHover = useExploreStore.getState().hoveredId;
        if (group.some((place) => place.id === currentHover)) {
          showPopup(group.find((p) => p.id === currentHover) ?? representative);
          return;
        }
        showPopup(representative);
      });
      marker.on("mouseout", scheduleHide);

      marker.on("popupopen", () => {
        const popupEl = marker.getPopup()?.getElement();
        if (!popupEl) return;

        popupEl.addEventListener("mouseover", () => {
          const currentHover = useExploreStore.getState().hoveredId;
          const place =
            group.find((p) => p.id === currentHover) ?? representative;
          showPopup(place);
        });
        popupEl.addEventListener("mouseout", scheduleHide);
      });

      cluster.addLayer(marker);
    }

    markerByPlaceIdRef.current = markerByPlaceId;
    map.addLayer(cluster);

    return () => {
      cancelHoverClose(hideTimerRef);
      clusterRef.current = null;
      closeFloatingPopup(map, floatingPopupRef.current);
      for (const marker of new Set(markerByPlaceId.values())) {
        unmountPopupRoot(marker.__popupRoot);
        marker.__popupRoot = undefined;
        marker.__popupContainer = undefined;
      }
      map.removeLayer(cluster);
      markerByPlaceIdRef.current = new Map();
    };
  }, [map, places, router, setHoveredId]);

  useEffect(() => {
    cancelOpenRef.current?.();
    cancelOpenRef.current = null;
    openGenRef.current += 1;
    const openGen = openGenRef.current;
    const floating = floatingPopupRef.current;

    const markerByPlaceId = markerByPlaceIdRef.current;
    if (markerByPlaceId.size === 0) return;

    if (!hoveredId) {
      closeFloatingPopup(map, floating);
      for (const marker of new Set(markerByPlaceId.values())) {
        marker.closePopup();
      }
      return;
    }

    const activeMarker = markerByPlaceId.get(hoveredId);
    if (!activeMarker) return;

    for (const marker of new Set(markerByPlaceId.values())) {
      const group = marker.__placeGroup ?? [];
      const activePlace =
        group.find((place) => place.id === hoveredId) ?? group[0];
      const isActive = group.some((place) => place.id === hoveredId);

      marker.setIcon(
        createPlaceMarkerIcon(activePlace, isActive, {
          stackCount: group.length,
        }),
      );

      if (!isActive) {
        marker.closePopup();
      }
    }

    const activeGroup = activeMarker.__placeGroup ?? [];
    const activePlace =
      activeGroup.find((place) => place.id === hoveredId) ?? activeGroup[0];

    const mountActiveCard = () => {
      if (openGen !== openGenRef.current) return;
      mountPopoverCard(activeMarker, activePlace, () =>
        router.push(`/place/${activePlace.id}`),
      );
    };

    if (markerIsVisible(activeMarker)) {
      closeFloatingPopup(map, floating);
      if (activeMarker.isPopupOpen()) {
        mountActiveCard();
        refreshPopupLayout(activeMarker.getPopup());
        return;
      }
      cancelOpenRef.current = openMarkerPopupWhenReady(
        map,
        activeMarker,
        mountActiveCard,
      );
      return;
    }

    for (const marker of new Set(markerByPlaceId.values())) {
      marker.closePopup();
    }

    if (openGen !== openGenRef.current) return;

    showFloatingPopup(map, floating, activePlace, () =>
      router.push(`/place/${activePlace.id}`),
    );

    return () => {
      cancelOpenRef.current?.();
      cancelOpenRef.current = null;
    };
  }, [hoveredId, map, router]);

  useEffect(() => () => cancelHoverClose(hideTimerRef), []);

  return null;
}

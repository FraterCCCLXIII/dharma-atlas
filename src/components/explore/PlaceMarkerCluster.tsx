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
import { stackSpiderfyPositions } from "@/lib/map-stack-spiderfy";
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
  const expandedStackRef = useRef<{
    parent: ClusterMarker;
    group: Place[];
    spiders: ClusterMarker[];
  } | null>(null);

  useEffect(() => {
    const collapseExpandedStack = () => {
      const expanded = expandedStackRef.current;
      if (!expanded) return;

      for (const spider of expanded.spiders) {
        spider.closePopup();
        unmountPopupRoot(spider.__popupRoot);
        spider.__popupRoot = undefined;
        spider.__popupContainer = undefined;
        map.removeLayer(spider);
      }

      for (const place of expanded.group) {
        markerByPlaceIdRef.current.set(place.id, expanded.parent);
      }

      expanded.parent.setOpacity(1);
      expanded.parent.closePopup();
      expandedStackRef.current = null;
    };

    const cluster = (
      L as typeof L & {
        markerClusterGroup: (options?: object) => MarkerClusterGroup;
      }
    ).markerClusterGroup({
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      maxClusterRadius: 56,
      iconCreateFunction: (cluster: { getChildCount: () => number }) =>
        createMapClusterIcon(cluster.getChildCount()),
    });

    clusterRef.current = cluster;

    const groups = groupPlacesByCoord(places);
    const markerByPlaceId = new Map<string, ClusterMarker>();

    const bindMarkerPopup = (marker: ClusterMarker, place: Place) => {
      if (!marker.getPopup()) {
        marker.bindPopup(document.createElement("div"), {
          closeButton: false,
          autoPan: false,
          offset: getMarkerPopupOffset(),
          className: "map-place-popup",
        });
      }
      mountPopoverCard(marker, place, () => router.push(`/place/${place.id}`));
    };

    const attachHoverPopup = (
      marker: ClusterMarker,
      group: Place[],
      resolvePlace: () => Place,
    ) => {
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

      marker.on("mouseover", () => showPopup(resolvePlace()));
      marker.on("mouseout", scheduleHide);

      marker.on("popupopen", () => {
        const popupEl = marker.getPopup()?.getElement();
        if (!popupEl) return;

        popupEl.addEventListener("mouseover", () => showPopup(resolvePlace()));
        popupEl.addEventListener("mouseout", scheduleHide);
      });

      return { showPopup, scheduleHide };
    };

    const expandStack = (parent: ClusterMarker, group: Place[]) => {
      collapseExpandedStack();
      parent.closePopup();

      const positions = stackSpiderfyPositions(map, parent.getLatLng(), group.length);
      const spiders: ClusterMarker[] = [];

      parent.setOpacity(0.35);

      group.forEach((place, index) => {
        const spider = L.marker(positions[index], {
          icon: createPlaceMarkerIcon(place, false),
          zIndexOffset: 1000 + index,
        }) as ClusterMarker;

        spider.__placeGroup = [place];
        bindMarkerPopup(spider, place);
        markerByPlaceId.set(place.id, spider);

        const { showPopup } = attachHoverPopup(spider, [place], () => place);

        spider.on("click", (event) => {
          L.DomEvent.stopPropagation(event);
          showPopup(place);
        });

        map.addLayer(spider);
        spiders.push(spider);
      });

      expandedStackRef.current = { parent, group, spiders };
      markerByPlaceIdRef.current = markerByPlaceId;
    };

    for (const [, group] of groups) {
      const representative = group[0];
      const marker = L.marker([representative.lat, representative.lng], {
        icon: createPlaceMarkerIcon(representative, false, {
          stackCount: group.length,
        }),
      }) as ClusterMarker;

      marker.__placeGroup = group;

      bindMarkerPopup(marker, representative);

      for (const place of group) {
        markerByPlaceId.set(place.id, marker);
      }

      const { showPopup } = attachHoverPopup(marker, group, () => {
        const currentHover = useExploreStore.getState().hoveredId;
        return group.find((place) => place.id === currentHover) ?? representative;
      });

      marker.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        if (group.length > 1) {
          if (expandedStackRef.current?.parent === marker) {
            collapseExpandedStack();
          } else {
            expandStack(marker, group);
          }
          return;
        }
        showPopup(representative);
      });

      cluster.addLayer(marker);
    }

    markerByPlaceIdRef.current = markerByPlaceId;
    map.addLayer(cluster);

    const onMapBackgroundClick = () => collapseExpandedStack();
    map.on("click", onMapBackgroundClick);
    map.on("zoomstart", collapseExpandedStack);

    return () => {
      map.off("click", onMapBackgroundClick);
      map.off("zoomstart", collapseExpandedStack);
      collapseExpandedStack();
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
          stackCount: group.length > 1 ? group.length : undefined,
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

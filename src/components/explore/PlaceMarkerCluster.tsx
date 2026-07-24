"use client";

import { useEffect, useMemo, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { useMap } from "react-leaflet";
import { MapPopoverCard } from "@/components/explore/MapPopoverCard";
import {
  createMapClusterIcon,
  createPlaceMarkerIcon,
} from "@/lib/map-markers";
import {
  cancelHoverClose,
  MAP_HOVER_POPUP_OPTIONS,
  openMarkerPopupNow,
  refreshPopupLayout,
  renderPopupRoot,
  scheduleHoverClose,
  unmountPopupRoot,
} from "@/lib/map-popup";
import { sameLngOffsets, worldLngOffsetsForBounds } from "@/lib/coords";
import { stackSpiderfyPositions } from "@/lib/map-stack-spiderfy";
import { useExploreStore } from "@/store/explore-store";
import type { ExploreMapPin, PlaceMarker } from "@/types/place";

type MapPlace = ExploreMapPin | PlaceMarker;

function placesFingerprint(places: MapPlace[]) {
  if (places.length === 0) return "";
  return places
    .map((place) => place.id)
    .sort()
    .join(",");
}

function coordKey(lat: number, lng: number) {
  return `${lat.toFixed(6)}:${lng.toFixed(6)}`;
}

/** Merge places that share identical coordinates (stacked_coords in the DB). */
function groupPlacesByCoord(places: MapPlace[]) {
  const groups = new Map<string, MapPlace[]>();
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
  removeLayer: (layer: L.Layer) => MarkerClusterGroup;
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
  place: MapPlace,
  latLng: L.LatLngExpression,
) {
  if (!refs.container) {
    refs.container = document.createElement("div");
    refs.root = createRoot(refs.container);
  }
  if (!refs.popup) {
    refs.popup = L.popup({ ...MAP_HOVER_POPUP_OPTIONS });
  }

  renderPopupRoot(
    refs.root!,
    <MapPopoverCard place={place} />,
    () => refreshPopupLayout(refs.popup ?? undefined),
  );

  refs.popup.setLatLng(latLng).setContent(refs.container).openOn(map);
}

type ClusterMarker = L.Marker & {
  __placeGroup?: MapPlace[];
  __lngOffset?: number;
  __popupContainer?: HTMLDivElement;
  __popupRoot?: Root;
};

function mountPopoverCard(marker: ClusterMarker, place: MapPlace) {
  if (!marker.__popupContainer) {
    marker.__popupContainer = document.createElement("div");
    marker.__popupRoot = createRoot(marker.__popupContainer);
    marker.setPopupContent(marker.__popupContainer);
  }

  renderPopupRoot(
    marker.__popupRoot!,
    <MapPopoverCard place={place} />,
    () => refreshPopupLayout(marker.getPopup()),
  );
}

export function PlaceMarkerCluster({ places }: { places: MapPlace[] }) {
  const map = useMap();
  const hoveredId = useExploreStore((s) => s.hoveredId);
  const setHoveredId = useExploreStore((s) => s.setHoveredId);
  // Rebuild only when the id set changes — not on every parent re-render.
  const placesKey = useMemo(() => placesFingerprint(places), [places]);
  const placesRef = useRef(places);
  placesRef.current = places;

  const markerByPlaceIdRef = useRef<Map<string, ClusterMarker[]>>(new Map());
  const clusterRef = useRef<MarkerClusterGroup | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openGenRef = useRef(0);
  const prevHoveredIdRef = useRef<string | null>(null);
  const floatingPopupRef = useRef<FloatingPopupRefs>({
    popup: null,
    container: null,
    root: null,
  });
  const expandedStackRef = useRef<{
    parent: ClusterMarker;
    group: MapPlace[];
    spiders: ClusterMarker[];
  } | null>(null);

  useEffect(() => {
    const places = placesRef.current;
    const registerMarker = (
      markerByPlaceId: Map<string, ClusterMarker[]>,
      placeId: string,
      marker: ClusterMarker,
    ) => {
      const list = markerByPlaceId.get(placeId) ?? [];
      list.push(marker);
      markerByPlaceId.set(placeId, list);
    };

    const unregisterMarker = (
      markerByPlaceId: Map<string, ClusterMarker[]>,
      placeId: string,
      marker: ClusterMarker,
    ) => {
      const list = markerByPlaceId.get(placeId);
      if (!list) return;
      const next = list.filter((entry) => entry !== marker);
      if (next.length === 0) markerByPlaceId.delete(placeId);
      else markerByPlaceId.set(placeId, next);
    };

    const replaceMarker = (
      markerByPlaceId: Map<string, ClusterMarker[]>,
      placeId: string,
      from: ClusterMarker,
      to: ClusterMarker,
    ) => {
      const list = markerByPlaceId.get(placeId) ?? [];
      const next = list.map((marker) => (marker === from ? to : marker));
      if (!next.includes(to)) next.push(to);
      markerByPlaceId.set(placeId, next);
    };

    const allMarkers = (markerByPlaceId: Map<string, ClusterMarker[]>) =>
      new Set([...markerByPlaceId.values()].flat());

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
        replaceMarker(
          markerByPlaceIdRef.current,
          place.id,
          // Spiders temporarily own the place id; restore the parent copy.
          expanded.spiders.find((s) => s.__placeGroup?.[0]?.id === place.id) ??
            expanded.parent,
          expanded.parent,
        );
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
      // Skip off-screen markers during pan — cheaper than painting every pin.
      removeOutsideVisibleBounds: true,
      animate: false,
      maxClusterRadius: 56,
      iconCreateFunction: (cluster: { getChildCount: () => number }) =>
        createMapClusterIcon(cluster.getChildCount()),
    });

    clusterRef.current = cluster;

    const groups = groupPlacesByCoord(places);
    const markerByPlaceId = new Map<string, ClusterMarker[]>();
    const markersByOffset = new Map<number, ClusterMarker[]>();
    let activeOffsets: number[] = [];

    const bindMarkerPopup = (marker: ClusterMarker, _place: MapPlace) => {
      if (!marker.getPopup()) {
        marker.bindPopup(document.createElement("div"), {
          ...MAP_HOVER_POPUP_OPTIONS,
        });
      }
      // Do not mount MapPopoverCard (and its photo) until hover/open.
      // Eagerly mounting every marker popup floods the network with image
      // requests and can stall list pagination fetches for tens of seconds.
    };

    const attachHoverPopup = (
      marker: ClusterMarker,
      group: MapPlace[],
      resolvePlace: () => MapPlace,
    ) => {
      const showPopup = (place: MapPlace) => {
        cancelHoverClose(hideTimerRef);
        setHoveredId(place.id);

        const open = () =>
          openMarkerPopupNow(marker, () => mountPopoverCard(marker, place));

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

    const expandStack = (parent: ClusterMarker, group: MapPlace[]) => {
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
        spider.__lngOffset = parent.__lngOffset;
        bindMarkerPopup(spider, place);
        replaceMarker(markerByPlaceId, place.id, parent, spider);

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

    const addOffset = (lngOffset: number) => {
      if (markersByOffset.has(lngOffset)) return;

      const created: ClusterMarker[] = [];

      for (const [, group] of groups) {
        const representative = group[0];
        const marker = L.marker(
          [representative.lat, representative.lng + lngOffset],
          {
            icon: createPlaceMarkerIcon(representative, false, {
              stackCount: group.length,
            }),
          },
        ) as ClusterMarker;

        marker.__placeGroup = group;
        marker.__lngOffset = lngOffset;

        bindMarkerPopup(marker, representative);

        for (const place of group) {
          registerMarker(markerByPlaceId, place.id, marker);
        }

        const { showPopup } = attachHoverPopup(marker, group, () => {
          const currentHover = useExploreStore.getState().hoveredId;
          return (
            group.find((place) => place.id === currentHover) ?? representative
          );
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
        created.push(marker);
      }

      markersByOffset.set(lngOffset, created);
      markerByPlaceIdRef.current = markerByPlaceId;
    };

    const removeOffset = (lngOffset: number) => {
      const markers = markersByOffset.get(lngOffset);
      if (!markers) return;

      const expanded = expandedStackRef.current;
      if (expanded && expanded.parent.__lngOffset === lngOffset) {
        collapseExpandedStack();
      }

      for (const marker of markers) {
        marker.closePopup();
        unmountPopupRoot(marker.__popupRoot);
        marker.__popupRoot = undefined;
        marker.__popupContainer = undefined;
        for (const place of marker.__placeGroup ?? []) {
          unregisterMarker(markerByPlaceId, place.id, marker);
        }
        cluster.removeLayer(marker);
      }

      markersByOffset.delete(lngOffset);
      markerByPlaceIdRef.current = markerByPlaceId;
    };

    const syncOffsets = () => {
      const bounds = map.getBounds();
      const next = worldLngOffsetsForBounds(bounds.getWest(), bounds.getEast());
      if (sameLngOffsets(activeOffsets, next)) return;

      const nextSet = new Set(next);
      for (const offset of next) addOffset(offset);
      for (const offset of markersByOffset.keys()) {
        if (!nextSet.has(offset)) removeOffset(offset);
      }
      activeOffsets = next;
    };

    map.addLayer(cluster);
    map.whenReady(syncOffsets);
    map.on("moveend", syncOffsets);
    map.on("zoomend", syncOffsets);

    const onMapBackgroundClick = () => collapseExpandedStack();
    map.on("click", onMapBackgroundClick);
    map.on("zoomstart", collapseExpandedStack);

    return () => {
      map.off("click", onMapBackgroundClick);
      map.off("zoomstart", collapseExpandedStack);
      map.off("moveend", syncOffsets);
      map.off("zoomend", syncOffsets);
      collapseExpandedStack();
      cancelHoverClose(hideTimerRef);
      clusterRef.current = null;
      closeFloatingPopup(map, floatingPopupRef.current);
      for (const marker of allMarkers(markerByPlaceId)) {
        unmountPopupRoot(marker.__popupRoot);
        marker.__popupRoot = undefined;
        marker.__popupContainer = undefined;
      }
      map.removeLayer(cluster);
      markerByPlaceIdRef.current = new Map();
    };
  }, [map, placesKey, setHoveredId]);

  useEffect(() => {
    openGenRef.current += 1;
    const openGen = openGenRef.current;
    const floating = floatingPopupRef.current;

    const markerByPlaceId = markerByPlaceIdRef.current;
    if (markerByPlaceId.size === 0) return;

    const prevHoveredId = prevHoveredIdRef.current;
    prevHoveredIdRef.current = hoveredId;

    const setMarkerActive = (marker: ClusterMarker, activeId: string | null) => {
      const group = marker.__placeGroup ?? [];
      if (group.length === 0) return;
      const activePlace =
        (activeId
          ? group.find((place) => place.id === activeId)
          : undefined) ?? group[0];
      const isActive = Boolean(
        activeId && group.some((place) => place.id === activeId),
      );
      marker.setIcon(
        createPlaceMarkerIcon(activePlace, isActive, {
          stackCount: group.length > 1 ? group.length : undefined,
        }),
      );
      if (!isActive) marker.closePopup();
    };

    // Only touch the previous + next hovered markers — full-set setIcon was
    // O(n) renderToStaticMarkup work on every list/map hover.
    if (prevHoveredId && prevHoveredId !== hoveredId) {
      for (const marker of markerByPlaceId.get(prevHoveredId) ?? []) {
        setMarkerActive(marker, null);
      }
    }

    if (!hoveredId) {
      closeFloatingPopup(map, floating);
      return;
    }

    const candidates = markerByPlaceId.get(hoveredId) ?? [];
    const activeMarker =
      candidates.find((marker) => markerIsVisible(marker)) ?? candidates[0];
    if (!activeMarker) return;

    for (const marker of candidates) {
      setMarkerActive(marker, hoveredId);
    }

    const activeGroup = activeMarker.__placeGroup ?? [];
    const activePlace =
      activeGroup.find((place) => place.id === hoveredId) ?? activeGroup[0];

    const mountActiveCard = () => {
      if (openGen !== openGenRef.current) return;
      mountPopoverCard(activeMarker, activePlace);
    };

    if (markerIsVisible(activeMarker)) {
      closeFloatingPopup(map, floating);
      if (activeMarker.isPopupOpen()) {
        mountActiveCard();
        refreshPopupLayout(activeMarker.getPopup());
        return;
      }
      // Open immediately — WhenReady waits a frame / moveend and made strip
      // auto-highlight feel lagged while scrolling the carousel.
      openMarkerPopupNow(activeMarker, mountActiveCard);
      return;
    }

    for (const marker of candidates) {
      marker.closePopup();
    }

    if (openGen !== openGenRef.current) return;

    showFloatingPopup(map, floating, activePlace, activeMarker.getLatLng());
  }, [hoveredId, map]);

  useEffect(() => () => cancelHoverClose(hideTimerRef), []);

  return null;
}

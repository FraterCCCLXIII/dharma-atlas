"use client";

import { useEffect, useRef, useState } from "react";
import { buildExplorePlacesSearchParams } from "@/lib/explore-places-query";
import { useExploreStore } from "@/store/explore-store";
import type { PlaceMarker } from "@/types/place";
import { PlaceCard } from "./PlaceCard";

const PAGE_SIZE = 20;

interface PlaceListProps {
  emptyReason?: "filters" | "map";
  /** True when desktop map/list sync is active. */
  syncListToMap?: boolean;
  /** Total markers matching filters (before map-bounds slice) — for empty-state copy. */
  filteredMarkerCount?: number;
}

function PlaceListHeader({ count }: { count: number }) {
  return (
    <p className="pb-4 text-sm font-medium tabular-nums text-ink-secondary">
      {count.toLocaleString()} located in this area
    </p>
  );
}

/** Build a compact page rail like: 1 … 4 5 6 … 20 */
function getPageRail(page: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, page]);
  for (const n of [page - 1, page + 1]) {
    if (n >= 1 && n <= totalPages) pages.add(n);
  }
  if (page <= 3) {
    for (const n of [2, 3, 4]) {
      if (n <= totalPages) pages.add(n);
    }
  }
  if (page >= totalPages - 2) {
    for (const n of [totalPages - 1, totalPages - 2, totalPages - 3]) {
      if (n >= 1) pages.add(n);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const rail: (number | "ellipsis")[] = [];
  for (const n of sorted) {
    const prev = rail[rail.length - 1];
    if (typeof prev === "number" && n - prev > 1) {
      rail.push("ellipsis");
    }
    rail.push(n);
  }
  return rail;
}

function PlaceListPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const rail = getPageRail(page, totalPages);

  return (
    <nav
      aria-label="Locations pagination"
      className="mt-4 flex items-center justify-between gap-2"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="shrink-0 rounded-full border border-border px-3 py-2 text-sm disabled:opacity-40 sm:px-4"
      >
        Previous
      </button>
      <ol className="flex min-w-0 flex-wrap items-center justify-center gap-1">
        {rail.map((item, index) =>
          item === "ellipsis" ? (
            <li
              key={`ellipsis-${index}`}
              aria-hidden
              className="px-1 text-sm text-ink-muted"
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={`flex h-9 min-w-9 items-center justify-center rounded-full px-2 text-sm tabular-nums transition-colors ${
                  item === page
                    ? "bg-brand text-brand-foreground"
                    : "text-ink-secondary hover:bg-surface-muted"
                }`}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="shrink-0 rounded-full border border-border px-3 py-2 text-sm disabled:opacity-40 sm:px-4"
      >
        Next
      </button>
    </nav>
  );
}

function boundsKey(
  bounds: { south: number; north: number; west: number; east: number } | null,
): string {
  if (!bounds) return "";
  // Quantize so sub-pixel Leaflet noise does not retrigger fetches.
  const q = (n: number) => n.toFixed(4);
  return `${q(bounds.south)}:${q(bounds.north)}:${q(bounds.west)}:${q(bounds.east)}`;
}

export function PlaceList({
  emptyReason = "filters",
  syncListToMap = false,
  filteredMarkerCount = 0,
}: PlaceListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const prevFilterKeyRef = useRef<string | null>(null);
  const prevMapBoundsKeyRef = useRef<string | null>(null);
  const [page, setPage] = useState(1);
  const [places, setPlaces] = useState<PlaceMarker[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageFetching, setPageFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const query = useExploreStore((s) => s.query);
  const traditions = useExploreStore((s) => s.traditions);
  const schools = useExploreStore((s) => s.schools);
  const types = useExploreStore((s) => s.types);
  const faiths = useExploreStore((s) => s.faiths);
  const mapBounds = useExploreStore((s) => s.mapBounds);
  const locationFilter = useExploreStore((s) => s.locationFilter);

  // Deliberately excludes map bounds: this key drives the reset-to-page-1 below,
  // and that should follow user intent (search, filters, a chosen location) only.
  const filterKey = [
    query,
    traditions.join(","),
    schools.join(","),
    types.join(","),
    faiths.join(","),
    locationFilter?.label ?? "",
    locationFilter ? boundsKey(locationFilter.bounds) : "",
  ].join("|");

  const mapBoundsKey =
    syncListToMap && !locationFilter ? boundsKey(mapBounds) : "";

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // Panning the map can shrink the result set past the current page. Derive the
  // page we actually render and fetch, so we clamp to the last available page
  // instead of requesting an out-of-range one.
  const safePage = Math.min(page, totalPages);

  // Reset page on user-intent filter changes only (not on mount / map moves).
  useEffect(() => {
    if (prevFilterKeyRef.current === null) {
      prevFilterKeyRef.current = filterKey;
      return;
    }
    if (prevFilterKeyRef.current === filterKey) return;
    prevFilterKeyRef.current = filterKey;
    setPage(1);
  }, [filterKey]);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();
    const params = buildExplorePlacesSearchParams({
      query,
      traditions,
      schools,
      types,
      faiths,
      page: safePage,
      pageSize: PAGE_SIZE,
      mapBounds,
      locationFilter,
      syncListToMap,
    });

    // Initial state is loading; later refetches keep prior cards visible.
    setError(null);
    setPageFetching(true);

    // Debounce map-pan / search typing only. Page changes must fetch immediately —
    // otherwise the rail shows the new page while stale cards linger, and a
    // completed older response can win the race and look like pagination failed.
    const boundsChanged = prevMapBoundsKeyRef.current !== mapBoundsKey;
    prevMapBoundsKeyRef.current = mapBoundsKey;
    const delayMs = query.trim() ? 200 : boundsChanged && mapBoundsKey ? 150 : 0;

    const timer = window.setTimeout(() => {
      fetch(`/api/explore/places?${params.toString()}`, {
        signal: controller.signal,
        // Prefer this over map popup photos competing for the same host.
        priority: "high",
      } as RequestInit)
        .then(async (res) => {
          if (!res.ok) throw new Error(`Failed to load places (${res.status})`);
          return res.json() as Promise<{
            places: PlaceMarker[];
            total: number;
          }>;
        })
        .then((data) => {
          // AbortController does not cancel already-resolved responses; ignore stale ones.
          if (requestId !== requestIdRef.current) return;
          setPlaces(data.places);
          setTotal(data.total);
          setLoading(false);
          setPageFetching(false);
          parentRef.current?.scrollTo({ top: 0 });
        })
        .catch((err: unknown) => {
          if (controller.signal.aborted || requestId !== requestIdRef.current) {
            return;
          }
          setError(err instanceof Error ? err.message : "Failed to load places");
          setPlaces([]);
          setTotal(0);
          setLoading(false);
          setPageFetching(false);
        });
    }, delayMs);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    filterKey,
    safePage,
    query,
    traditions,
    schools,
    types,
    faiths,
    mapBounds,
    mapBoundsKey,
    locationFilter,
    syncListToMap,
  ]);

  function goToPage(nextPage: number) {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    setPage(clamped);
  }

  if (loading && places.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-sm text-ink-muted">
        Loading locations…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="font-display text-lg font-semibold text-ink">
          Couldn’t load locations
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">{error}</p>
      </div>
    );
  }

  if (total === 0) {
    const reason =
      emptyReason === "map" ||
      (filteredMarkerCount > 0 && syncListToMap && !locationFilter)
        ? "map"
        : "filters";
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="px-4 pt-4 sm:px-6 sm:pt-6">
          <PlaceListHeader count={0} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-4 text-center sm:px-6 sm:pb-6">
          <p className="font-display text-lg font-semibold text-ink">
            {reason === "map" ? "No places in this map area" : "No places found"}
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            {reason === "map"
              ? "Pan or zoom the map to explore other areas, or clear your filters."
              : "Try a different search or clear your filters to see more centers and temples."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={`min-h-0 flex-1 overflow-y-auto px-4 pt-4 pb-4 sm:px-6 sm:pt-6 sm:pb-6 ${
        pageFetching ? "opacity-60" : ""
      }`}
      aria-busy={pageFetching || undefined}
    >
      <PlaceListHeader count={total} />
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
        {places.map((place, index) => (
          <PlaceCard key={place.id} place={place} index={index} />
        ))}
      </div>
      <PlaceListPagination
        page={safePage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}

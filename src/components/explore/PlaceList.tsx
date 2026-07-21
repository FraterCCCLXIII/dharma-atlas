"use client";

import { useEffect, useRef, useState } from "react";
import type { Place } from "@/types/place";
import { PlaceCard } from "./PlaceCard";

const PAGE_SIZE = 20;

interface PlaceListProps {
  places: Place[];
  emptyReason?: "filters" | "map";
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
  // Keep a bit more context near the ends so the rail doesn't collapse oddly.
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
      className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-4 py-3 sm:px-6"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="shrink-0 rounded-full border border-border px-3 py-2 text-sm disabled:opacity-40 sm:px-4"
      >
        Previous
      </button>
      <ol className="flex min-w-0 items-center justify-center gap-1 overflow-x-auto">
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

export function PlaceList({
  places,
  emptyReason = "filters",
}: PlaceListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);

  const placesKey = places.map((place) => place.id).join(",");
  const totalPages = Math.max(1, Math.ceil(places.length / PAGE_SIZE));

  // Reset to the first page when the filtered set changes (filters / map bounds).
  useEffect(() => {
    setPage(1);
    parentRef.current?.scrollTo({ top: 0 });
  }, [placesKey]);

  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pagePlaces = places.slice(start, start + PAGE_SIZE);

  function goToPage(nextPage: number) {
    const clamped = Math.min(Math.max(1, nextPage), totalPages);
    setPage(clamped);
    parentRef.current?.scrollTo({ top: 0 });
  }

  if (places.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="px-4 pt-4 sm:px-6 sm:pt-6">
          <PlaceListHeader count={0} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-4 text-center sm:px-6 sm:pb-6">
          <p className="font-display text-lg font-semibold text-ink">
            {emptyReason === "map" ? "No places in this map area" : "No places found"}
          </p>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            {emptyReason === "map"
              ? "Pan or zoom the map to explore other areas, or clear your filters."
              : "Try a different search or clear your filters to see more centers and temples."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 px-4 pt-4 sm:px-6 sm:pt-6">
        <PlaceListHeader count={places.length} />
      </div>
      <div
        ref={parentRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6"
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          {pagePlaces.map((place, index) => (
            <PlaceCard key={place.id} place={place} index={index} />
          ))}
        </div>
      </div>
      <PlaceListPagination
        page={safePage}
        totalPages={totalPages}
        onPageChange={goToPage}
      />
    </div>
  );
}

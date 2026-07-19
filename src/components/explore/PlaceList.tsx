"use client";

import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Place } from "@/types/place";
import { PlaceCard } from "./PlaceCard";

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

function useColumnCount() {
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const update = () => setColumnCount(media.matches ? 2 : 1);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return columnCount;
}

function rowKey(places: Place[], index: number, columnCount: number) {
  const startIndex = index * columnCount;
  return places
    .slice(startIndex, startIndex + columnCount)
    .map((place) => place.id)
    .join("|");
}

export function PlaceList({
  places,
  emptyReason = "filters",
}: PlaceListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const columnCount = useColumnCount();
  const rowCount = Math.ceil(places.length / columnCount);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 4,
    getItemKey: (index) => rowKey(places, index, columnCount),
  });

  const placesKey = places.map((place) => place.id).join(",");

  // Map-bounds filtering reshuffles rows; drop stale height cache so rows
  // don't overlap and intercept clicks meant for the card underneath.
  useEffect(() => {
    virtualizer.measure();
  }, [placesKey, columnCount, virtualizer]);

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
      <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const startIndex = virtualRow.index * columnCount;
            const rowPlaces = places.slice(startIndex, startIndex + columnCount);

            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement}
                className="absolute left-0 top-0 w-full pb-6"
                style={{ transform: `translateY(${virtualRow.start}px)` }}
              >
                <div
                  className={`grid gap-x-4 gap-y-6 ${
                    columnCount === 2 ? "grid-cols-2" : "grid-cols-1"
                  }`}
                >
                  {rowPlaces.map((place, offset) => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      index={startIndex + offset}
                      animateEntrance={false}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

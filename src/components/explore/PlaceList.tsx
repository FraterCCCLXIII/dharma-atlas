"use client";

import { useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Place } from "@/types/place";
import { PlaceCard } from "./PlaceCard";

interface PlaceListProps {
  places: Place[];
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

export function PlaceList({ places }: PlaceListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const columnCount = useColumnCount();
  const rowCount = Math.ceil(places.length / columnCount);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 4,
    measureElement: (element) => element?.getBoundingClientRect().height ?? 300,
  });

  if (places.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink">
          No places found
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Try a different search or clear your filters to see more centers and temples.
        </p>
      </div>
    );
  }

  return (
    <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
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
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

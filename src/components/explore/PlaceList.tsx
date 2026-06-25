"use client";

import type { Place } from "@/types/place";
import { PlaceCard } from "./PlaceCard";

interface PlaceListProps {
  places: Place[];
}

export function PlaceList({ places }: PlaceListProps) {
  if (places.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink">
          No places found
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Try a different search or clear your filters to see more centers and
          temples.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-2">
        {places.map((place, index) => (
          <PlaceCard key={place.id} place={place} index={index} />
        ))}
      </div>
    </div>
  );
}

"use client";

import type { DirectoryEntry } from "@/lib/directory";
import { PlaceCard } from "./PlaceCard";
import { TeacherCard } from "./TeacherCard";

interface DirectoryListProps {
  entries: DirectoryEntry[];
}

export function DirectoryList({ entries }: DirectoryListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink">
          Nothing found
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Try a different search or clear your filters to see more locations
          and people.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="grid grid-cols-1 gap-x-4 gap-y-6 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-2">
        {entries.map((entry, index) =>
          entry.kind === "place" ? (
            <PlaceCard
              key={`place-${entry.id}`}
              place={entry.data}
              index={index}
              showKindBadge
            />
          ) : (
            <TeacherCard
              key={`teacher-${entry.id}`}
              teacher={entry.data}
              index={index}
              showKindBadge
            />
          ),
        )}
      </div>
    </div>
  );
}

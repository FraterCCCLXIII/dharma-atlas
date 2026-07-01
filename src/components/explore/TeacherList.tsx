"use client";

import { useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  groupTeachersByTraditionAndSchool,
  sortTeachersAlphabetically,
  type PeopleSortOrder,
} from "@/lib/teacher-groups";
import type { Teacher } from "@/types/teacher";
import { TeacherCard } from "./TeacherCard";

interface TeacherListProps {
  teachers: Teacher[];
  variant?: "default" | "tile";
  sortOrder?: PeopleSortOrder;
}

function TeacherTileGrid({
  teachers,
  compact,
  startIndex = 0,
}: {
  teachers: Teacher[];
  compact: boolean;
  startIndex?: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {teachers.map((teacher, index) => (
        <TeacherCard
          key={teacher.slug}
          teacher={teacher}
          index={startIndex + index}
          compact={compact}
        />
      ))}
    </div>
  );
}

function TeacherGroupedView({
  teachers,
  compact,
}: {
  teachers: Teacher[];
  compact: boolean;
}) {
  const groups = useMemo(
    () => groupTeachersByTraditionAndSchool(teachers),
    [teachers],
  );

  let cardIndex = 0;

  return (
    <div className="space-y-14 py-6">
      {groups.map((group) => {
        const groupStartIndex = cardIndex;
        cardIndex += group.teachers.length;

        return (
          <section key={group.id} className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-ink">
              {group.title}
            </h2>
            <TeacherTileGrid
              teachers={group.teachers}
              compact={compact}
              startIndex={groupStartIndex}
            />
          </section>
        );
      })}
    </div>
  );
}

export function TeacherList({
  teachers,
  variant = "default",
  sortOrder = "alphabetical",
}: TeacherListProps) {
  const isTile = variant === "tile";
  const compact = isTile;
  const parentRef = useRef<HTMLDivElement>(null);

  const sortedTeachers = useMemo(
    () => sortTeachersAlphabetically(teachers),
    [teachers],
  );

  const virtualizer = useVirtualizer({
    count: sortedTeachers.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (isTile ? 200 : 220),
    overscan: 6,
  });

  if (teachers.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center px-6 py-20 text-center ${
          isTile ? "" : "min-h-0 flex-1"
        }`}
      >
        <p className="font-display text-lg font-semibold text-ink">
          No people found
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Try a different search or clear your filters to see more profiles.
        </p>
      </div>
    );
  }

  if (isTile) {
    if (sortOrder === "tradition-school") {
      return <TeacherGroupedView teachers={teachers} compact={compact} />;
    }

    return (
      <div className="py-6">
        <TeacherTileGrid teachers={sortedTeachers} compact={compact} />
      </div>
    );
  }

  return (
    <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div
            key={item.key}
            className="absolute left-0 top-0 w-full pb-6"
            style={{ transform: `translateY(${item.start}px)` }}
          >
            <TeacherCard teacher={sortedTeachers[item.index]} index={item.index} compact={compact} />
          </div>
        ))}
      </div>
    </div>
  );
}

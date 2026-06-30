"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Teacher } from "@/types/teacher";
import { TeacherCard } from "./TeacherCard";

interface TeacherListProps {
  teachers: Teacher[];
  variant?: "default" | "tile";
}

export function TeacherList({ teachers, variant = "default" }: TeacherListProps) {
  const isTile = variant === "tile";
  const compact = isTile;
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: teachers.length,
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
    return (
      <div className="py-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {teachers.map((teacher, index) => (
            <TeacherCard key={teacher.slug} teacher={teacher} index={index} compact={compact} />
          ))}
        </div>
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
            <TeacherCard teacher={teachers[item.index]} index={item.index} compact={compact} />
          </div>
        ))}
      </div>
    </div>
  );
}

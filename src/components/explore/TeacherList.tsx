"use client";

import type { Teacher } from "@/types/teacher";
import { TeacherCard } from "./TeacherCard";

interface TeacherListProps {
  teachers: Teacher[];
  variant?: "default" | "tile";
}

export function TeacherList({ teachers, variant = "default" }: TeacherListProps) {
  const isTile = variant === "tile";
  const compact = isTile;

  if (teachers.length === 0) {
    return (
      <div
        className={`flex flex-col items-center justify-center px-6 py-20 text-center ${
          isTile ? "" : "min-h-0 flex-1"
        }`}
      >
        <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink">
          No teachers found
        </p>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Try a different search or clear your filters to see more spiritual
          teachers.
        </p>
      </div>
    );
  }

  return (
    <div className={isTile ? "py-6" : "min-h-0 flex-1 overflow-y-auto"}>
      <div
        className={
          isTile
            ? "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid grid-cols-1 gap-x-4 gap-y-6 p-4 sm:grid-cols-2 sm:p-6 xl:grid-cols-2"
        }
      >
        {teachers.map((teacher, index) => (
          <TeacherCard
            key={teacher.slug}
            teacher={teacher}
            index={index}
            compact={compact}
          />
        ))}
      </div>
    </div>
  );
}

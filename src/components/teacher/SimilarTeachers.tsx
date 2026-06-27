"use client";

import Link from "next/link";
import { cardLiftClassName } from "@/lib/card-styles";
import { formatTeacherSchoolLine } from "@/lib/schools";
import { formatLifespan } from "@/types/teacher";
import type { Teacher } from "@/types/teacher";

interface SimilarTeachersProps {
  teachers: Teacher[];
}

export function SimilarTeachers({ teachers }: SimilarTeachersProps) {
  if (teachers.length === 0) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
          Also in the directory
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Other teachers in the same tradition and lineage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teachers.map((teacher) => (
          <Link
            key={teacher.slug}
            href={`/teacher/${teacher.slug}`}
            className={`group overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)] ${cardLiftClassName}`}
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-muted">
              {teacher.photo ? (
                <img
                  src={teacher.photo}
                  alt={`Portrait of ${teacher.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="space-y-2 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-brand">
                {formatTeacherSchoolLine(teacher, true)}
              </p>
              <h3 className="line-clamp-2 font-[family-name:var(--font-fraunces)] text-sm font-semibold leading-snug text-ink group-hover:text-brand">
                {teacher.name}
              </h3>
              <p className="text-xs text-ink-muted">
                {formatLifespan(teacher) ?? teacher.location}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

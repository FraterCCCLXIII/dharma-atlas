"use client";

import Link from "next/link";
import { personProfilePath } from "@/lib/explore-routes";
import {
  cardContentClassName,
  cardImageFrameClassName,
  cardImagePaddingClassName,
  cardLiftClassName,
} from "@/lib/card-styles";
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
        <h2 className="font-display text-2xl font-semibold text-ink">
          Also in the directory
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Other people in the same tradition and lineage.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {teachers.map((teacher) => (
          <Link
            key={teacher.slug}
            href={personProfilePath(teacher.slug)}
            className={`group rounded-2xl ${cardLiftClassName}`}
          >
            <div className={cardImagePaddingClassName}>
              <div
                className={`relative aspect-[4/5] bg-surface-muted ${cardImageFrameClassName}`}
              >
                {teacher.photo ? (
                  <img
                    src={teacher.photo}
                    alt={`Portrait of ${teacher.name}`}
                    loading="lazy"
                    className="h-full w-full rounded-xl object-cover"
                  />
                ) : null}
              </div>
            </div>
            <div className={cardContentClassName}>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                {formatTeacherSchoolLine(teacher, true)}
              </p>
              <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug text-ink">
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

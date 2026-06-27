"use client";

import Link from "next/link";
import { User } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { cardLiftClassName } from "@/lib/card-styles";
import { formatTeacherSchoolLine } from "@/lib/schools";
import { formatLifespan } from "@/types/teacher";
import type { Teacher } from "@/types/teacher";

interface TeacherCardProps {
  teacher: Teacher;
  index: number;
  showKindBadge?: boolean;
  compact?: boolean;
}

export function TeacherCard({
  teacher,
  index,
  showKindBadge,
  compact,
}: TeacherCardProps) {
  const subtitle = formatLifespan(teacher) ?? teacher.location;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.2) }}
    >
      <Link
        href={`/teacher/${teacher.slug}`}
        className={`group block overflow-hidden rounded-2xl border border-border bg-surface-elevated text-left shadow-[var(--shadow-card)] ${cardLiftClassName} hover:border-brand/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40`}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-muted">
          {teacher.photo ? (
            <img
              src={teacher.photo}
              alt={`Portrait of ${teacher.name}`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-stone-600 via-neutral-700 to-zinc-900">
              <User size={48} weight="duotone" className="text-white/40" />
            </div>
          )}
          {showKindBadge && (
            <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
              Teacher
            </span>
          )}
        </div>

        <div className={`space-y-2 ${compact ? "p-3" : "p-4"}`}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-brand">
            {formatTeacherSchoolLine(teacher, compact)}
          </p>
          <h3
            className={`line-clamp-2 font-[family-name:var(--font-fraunces)] font-semibold leading-snug text-ink group-hover:text-brand ${
              compact ? "text-sm" : "text-base"
            }`}
          >
            {teacher.name}
          </h3>
          <p className="text-xs text-ink-muted">{subtitle}</p>
          {!compact && (
            <p className="line-clamp-3 text-sm leading-relaxed text-ink-secondary">
              {teacher.shortBio}
            </p>
          )}
        </div>
      </Link>
    </motion.article>
  );
}

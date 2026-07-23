"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { User, X } from "@phosphor-icons/react";
import { MarkdownText } from "@/components/ui/MarkdownText";
import type { PlaceTeacher } from "@/types/place";
import type { Teacher } from "@/types/teacher";

interface PlaceGuidingTeachersSectionProps {
  guidingTeachers: PlaceTeacher[];
  /** Soft-matched teachers from retreat locations (legacy). */
  relatedTeachers?: Teacher[];
}

function TeacherAvatar({
  teacher,
  sizeClassName,
  sizes,
}: {
  teacher: PlaceTeacher;
  sizeClassName: string;
  sizes: string;
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-surface-muted ${sizeClassName}`}
      aria-hidden={teacher.imagePath ? undefined : true}
    >
      {teacher.imagePath ? (
        <Image
          src={teacher.imagePath}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-ink-muted">
          <User weight="duotone" className="h-[48%] w-[48%]" />
        </div>
      )}
    </div>
  );
}

function TeacherBioModal({
  teacher,
  onClose,
}: {
  teacher: PlaceTeacher;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const hasBio = Boolean(teacher.bio?.trim());

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={teacher.title ? descriptionId : undefined}
        className="relative z-10 flex max-h-[min(90dvh,720px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-float)]"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-elevated/90 text-ink-muted shadow-sm transition hover:bg-surface-muted hover:text-ink"
          aria-label="Close"
        >
          <X size={16} weight="bold" />
        </button>

        <div className="min-h-0 overflow-y-auto px-6 pb-6 pt-8">
          <div className="flex flex-col items-center text-center">
            <TeacherAvatar
              teacher={teacher}
              sizeClassName="h-28 w-28 ring-4 ring-surface-muted"
              sizes="112px"
            />
            <h2
              id={titleId}
              className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink"
            >
              {teacher.displayName}
            </h2>
            {teacher.title ? (
              <p id={descriptionId} className="mt-1 text-sm text-ink-secondary">
                {teacher.title}
              </p>
            ) : null}
          </div>

          {hasBio ? (
            <MarkdownText className="mt-6 text-left text-sm text-ink-secondary">
              {teacher.bio!}
            </MarkdownText>
          ) : (
            <p className="mt-6 text-center text-sm text-ink-muted">
              No bio added yet.
            </p>
          )}

          {teacher.teacherSlug ? (
            <div className="mt-6 flex justify-center">
              <Link
                href={`/person/${teacher.teacherSlug}`}
                className="inline-flex rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
              >
                View full profile
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function PlaceGuidingTeachersSection({
  guidingTeachers,
  relatedTeachers = [],
}: PlaceGuidingTeachersSectionProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = guidingTeachers.find((teacher) => teacher.id === selectedId) ?? null;

  const guidingSlugs = new Set(
    guidingTeachers.map((t) => t.teacherSlug).filter(Boolean),
  );
  const related = relatedTeachers.filter((t) => !guidingSlugs.has(t.slug));

  if (guidingTeachers.length === 0 && related.length === 0) return null;

  return (
    <section className="space-y-8 border-b border-border pb-10">
      {guidingTeachers.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            Guiding teachers
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {guidingTeachers.map((teacher) => (
              <li key={teacher.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(teacher.id)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-elevated p-4 text-left transition hover:border-brand/30 hover:bg-surface-muted/40"
                >
                  <TeacherAvatar
                    teacher={teacher}
                    sizeClassName="h-14 w-14"
                    sizes="56px"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{teacher.displayName}</p>
                    {teacher.title ? (
                      <p className="mt-0.5 text-sm text-ink-secondary">{teacher.title}</p>
                    ) : null}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {related.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-semibold text-ink">
            {guidingTeachers.length > 0 ? "Programs & visiting teachers" : "Teachers & programs"}
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {related.map((teacher) => (
              <li key={teacher.slug}>
                <Link
                  href={`/person/${teacher.slug}`}
                  className="block rounded-xl border border-border bg-surface-elevated p-4 transition hover:border-brand/30"
                >
                  <p className="font-medium text-ink">{teacher.name}</p>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {teacher.tradition}
                    {teacher.lineage ? ` · ${teacher.lineage}` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selected ? (
        <TeacherBioModal teacher={selected} onClose={() => setSelectedId(null)} />
      ) : null}
    </section>
  );
}

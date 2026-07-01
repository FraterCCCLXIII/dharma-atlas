"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Teacher } from "@/types/teacher";
import { TeacherCard } from "./TeacherCard";

export interface TeacherCarouselProps {
  teachers: Teacher[];
  ariaLabel: string;
  eyebrow: string;
  title: string;
  description?: string;
  className?: string;
}

const SCROLL_STEP = 320;

export function TeacherCarousel({
  teachers,
  ariaLabel,
  eyebrow,
  title,
  description,
  className = "pb-8 pt-6",
}: TeacherCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [teachers.length, updateScrollState]);

  const scrollBy = (direction: -1 | 1) => {
    scrollRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: "smooth",
    });
  };

  if (teachers.length === 0) return null;

  const scrollLabel = title.toLowerCase();

  return (
    <section aria-label={ariaLabel} className={className}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
            {eyebrow}
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 max-w-xl text-sm text-ink-secondary">
              {description}
            </p>
          ) : null}
        </div>

        {teachers.length > 3 && (
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canScrollLeft}
              aria-label={`Scroll ${scrollLabel} left`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-elevated text-ink-secondary transition hover:border-border-strong hover:text-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <CaretLeft size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canScrollRight}
              aria-label={`Scroll ${scrollLabel} right`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-elevated text-ink-secondary transition hover:border-border-strong hover:text-ink disabled:pointer-events-none disabled:opacity-40"
            >
              <CaretRight size={16} weight="bold" />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="-mx-1 flex gap-4 overflow-x-auto scroll-smooth px-1 pb-1 [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
      >
        {teachers.map((teacher, index) => (
          <div
            key={teacher.slug}
            className="w-[9.5rem] shrink-0 snap-start sm:w-[10.75rem] lg:w-[11.5rem]"
          >
            <TeacherCard teacher={teacher} index={index} compact />
          </div>
        ))}
      </div>
    </section>
  );
}

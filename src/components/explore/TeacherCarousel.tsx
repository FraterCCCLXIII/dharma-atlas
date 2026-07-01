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
const SCROLLBAR_IDLE_MS = 1200;

export function TeacherCarousel({
  teachers,
  ariaLabel,
  eyebrow,
  title,
  description,
  className = "pb-8 pt-6",
}: TeacherCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const scrollbarFadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollbarVisible, setScrollbarVisible] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScroll - 4);
  }, []);

  const scheduleScrollbarHide = useCallback(() => {
    if (scrollbarFadeTimer.current) clearTimeout(scrollbarFadeTimer.current);
    scrollbarFadeTimer.current = setTimeout(() => {
      if (!hoverRef.current) setScrollbarVisible(false);
    }, SCROLLBAR_IDLE_MS);
  }, []);

  const revealScrollbar = useCallback(() => {
    setScrollbarVisible(true);
    scheduleScrollbarHide();
  }, [scheduleScrollbarHide]);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      updateScrollState();
      revealScrollbar();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollState);
      if (scrollbarFadeTimer.current) clearTimeout(scrollbarFadeTimer.current);
    };
  }, [teachers.length, updateScrollState, revealScrollbar]);

  const scrollBy = (direction: -1 | 1) => {
    revealScrollbar();
    scrollRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: "smooth",
    });
  };

  if (teachers.length === 0) return null;

  const scrollLabel = title.toLowerCase();
  const showArrows = teachers.length > 3;

  const arrowClassName =
    "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated text-ink-secondary shadow-[var(--shadow-card)] transition hover:border-border-strong hover:bg-surface-muted hover:text-ink disabled:pointer-events-none disabled:opacity-35";

  return (
    <section aria-label={ariaLabel} className={className}>
      <div className="mb-5">
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

      <div className="flex items-center gap-2 sm:gap-3">
        {showArrows ? (
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${scrollLabel} left`}
            className={arrowClassName}
          >
            <CaretLeft size={22} weight="bold" />
          </button>
        ) : null}

        <div
          ref={scrollRef}
          onMouseEnter={() => {
            hoverRef.current = true;
            revealScrollbar();
          }}
          onMouseLeave={() => {
            hoverRef.current = false;
            scheduleScrollbarHide();
          }}
          className={`carousel-track min-w-0 flex-1 flex gap-4 overflow-x-auto scroll-smooth pb-2 snap-x snap-mandatory ${
            scrollbarVisible ? "is-scrollbar-visible" : ""
          }`}
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

        {showArrows ? (
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={!canScrollRight}
            aria-label={`Scroll ${scrollLabel} right`}
            className={arrowClassName}
          >
            <CaretRight size={22} weight="bold" />
          </button>
        ) : null}
      </div>
    </section>
  );
}

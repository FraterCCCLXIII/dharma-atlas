"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

/**
 * Flat mobile strip under the map: optional control row + horizontal results.
 * Horizontal inset comes from the parent (same px as the map panel).
 */
export function MobileMapResultsPanel({
  leading,
  trailing,
  children,
  empty,
  /** When this changes (e.g. pagination page), scroll the results row back to the start. */
  resetScrollKey,
  /** Fires with the place id whose card is nearest the horizontal center. */
  onCenteredIdChange,
}: {
  leading?: ReactNode;
  trailing?: ReactNode;
  children?: ReactNode;
  empty?: ReactNode;
  resetScrollKey?: string | number;
  onCenteredIdChange?: (id: string | null) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const onCenteredIdChangeRef = useRef(onCenteredIdChange);
  onCenteredIdChangeRef.current = onCenteredIdChange;
  const lastCenteredIdRef = useRef<string | null>(null);
  const trackCentered = Boolean(onCenteredIdChange);

  useEffect(() => {
    if (resetScrollKey === undefined) return;
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollLeft = 0;
  }, [resetScrollKey]);

  useEffect(() => {
    if (!trackCentered) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let frame = 0;

    const reportCentered = () => {
      const items = scroller.querySelectorAll<HTMLElement>("[data-map-strip-id]");
      if (items.length === 0) {
        if (lastCenteredIdRef.current !== null) {
          lastCenteredIdRef.current = null;
          onCenteredIdChangeRef.current?.(null);
        }
        return;
      }

      const scrollerRect = scroller.getBoundingClientRect();
      const centerX = scrollerRect.left + scrollerRect.width / 2;
      let bestId: string | null = null;
      let bestDist = Infinity;

      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const dist = Math.abs(itemCenter - centerX);
        if (dist < bestDist) {
          bestDist = dist;
          bestId = item.dataset.mapStripId ?? null;
        }
      }

      if (bestId !== lastCenteredIdRef.current) {
        lastCenteredIdRef.current = bestId;
        onCenteredIdChangeRef.current?.(bestId);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        reportCentered();
      });
    };

    reportCentered();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      // Do not clear the centered id here — parent re-renders (from setHoveredId)
      // used to remount this effect and wipe the highlight, which felt like lag.
    };
  }, [trackCentered, resetScrollKey]);

  // Clear only when the strip stops tracking center (leave map mode / unmount).
  useEffect(() => {
    if (trackCentered) return;
    if (lastCenteredIdRef.current === null) return;
    lastCenteredIdRef.current = null;
    onCenteredIdChangeRef.current?.(null);
  }, [trackCentered]);

  return (
    <div className="flex flex-col">
      {leading || trailing ? (
        <div className="flex h-10 shrink-0 items-center gap-1.5 pt-1">
          {leading ? (
            <div className="min-w-0 flex-1 overflow-x-auto">{leading}</div>
          ) : (
            <div className="min-w-0 flex-1" />
          )}
          {trailing}
        </div>
      ) : null}
      {children ? (
        <div
          ref={scrollerRef}
          className="-mx-3 min-h-0 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-3 pt-1.5 sm:-mx-4"
        >
          <div className="flex w-max items-stretch gap-2.5 px-3 sm:px-4">
            {children}
          </div>
        </div>
      ) : empty ? (
        <div className="pb-3 pt-1.5 text-sm text-ink-muted">{empty}</div>
      ) : null}
    </div>
  );
}

export function MobileMapPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return (
      <span className="shrink-0 px-1 text-xs tabular-nums text-ink-muted">
        {page} / {Math.max(totalPages, 1)}
      </span>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition hover:bg-surface-muted hover:text-ink disabled:opacity-35"
      >
        <CaretLeft size={16} weight="bold" />
      </button>
      <span className="min-w-[3.25rem] text-center text-xs font-medium tabular-nums text-ink">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-secondary transition hover:bg-surface-muted hover:text-ink disabled:opacity-35"
      >
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  );
}

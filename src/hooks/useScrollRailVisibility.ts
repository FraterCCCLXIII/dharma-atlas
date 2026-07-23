"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Hide a secondary nav rail when the user scrolls down; show it again on
 * scroll up or when near the top of the scroll container.
 *
 * Listens in the capture phase so nested overflow scrollers (explore list,
 * feature page main, etc.) are observed even when the shell itself does not
 * scroll.
 */
export function useScrollRailVisibility(
  scrollRef: RefObject<HTMLElement | null>,
  options?: {
    topRevealPx?: number;
    deltaPx?: number;
    /** Reset to visible when this value changes (e.g. pathname). */
    resetKey?: string;
  },
): boolean {
  const topRevealPx = options?.topRevealPx ?? 16;
  const deltaPx = options?.deltaPx ?? 8;
  const resetKey = options?.resetKey;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(false);
  }, [resetKey]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const lastYByEl = new WeakMap<HTMLElement, number>();
    let frame = 0;

    const onScroll = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (!root.contains(target)) return;

      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = target.scrollTop;
        // Seed unknown scrollers at 0 so the first nested scroll delta is real
        // (using `?? y` would always yield delta 0 on the first event).
        const lastY = lastYByEl.get(target) ?? 0;
        const delta = y - lastY;

        if (y <= topRevealPx) {
          setCollapsed(false);
        } else if (delta > deltaPx) {
          setCollapsed(true);
        } else if (delta < -deltaPx) {
          setCollapsed(false);
        }

        lastYByEl.set(target, y);
      });
    };

    // Scroll does not bubble; capture so nested explore scrollers are seen.
    root.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      root.removeEventListener("scroll", onScroll, { capture: true });
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [scrollRef, topRevealPx, deltaPx]);

  return !collapsed;
}

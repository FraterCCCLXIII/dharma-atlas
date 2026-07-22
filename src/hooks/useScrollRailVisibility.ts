"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Hide a secondary nav rail when the user scrolls down; show it again on
 * scroll up or when near the top of the scroll container.
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
    const el = scrollRef.current;
    if (!el) return;

    let lastY = el.scrollTop;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const y = el.scrollTop;
        const delta = y - lastY;

        if (y <= topRevealPx) {
          setCollapsed(false);
        } else if (delta > deltaPx) {
          setCollapsed(true);
        } else if (delta < -deltaPx) {
          setCollapsed(false);
        }

        lastY = y;
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [scrollRef, topRevealPx, deltaPx]);

  return !collapsed;
}

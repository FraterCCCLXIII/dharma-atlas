"use client";

import {
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

const NAV_COLLISION_GAP_PX = 12;

export type NavBarCollisionState = {
  logoCompact: boolean;
  /** People/Places live under search, so they are never collapsed into the menu. */
  navLinksCollapsed: boolean;
};

/**
 * Measure whether the wordmark collides with the search field.
 * Returns `null` until the first layout pass so consumers can use CSS breakpoint
 * fallbacks — avoids flashing the compact (mobile) nav on desktop first paint.
 */
export function useNavLogoCompact(
  navRowRef: RefObject<HTMLElement | null>,
  logoRef: RefObject<HTMLElement | null>,
  centerRef: RefObject<HTMLElement | null>,
  wordmarkMeasureRef: RefObject<HTMLElement | null>,
  leftClusterRef: RefObject<HTMLElement | null> | undefined,
): NavBarCollisionState | null {
  const [state, setState] = useState<NavBarCollisionState | null>(null);

  useLayoutEffect(() => {
    const row = navRowRef.current;
    const logo = logoRef.current;
    const center = centerRef.current;
    const measure = wordmarkMeasureRef.current;
    if (!row || !logo || !center || !measure) return;

    const check = () => {
      const logoRect = logo.getBoundingClientRect();
      const centerLeft = center.getBoundingClientRect().left;

      const availableWidth =
        centerLeft - logoRect.left - NAV_COLLISION_GAP_PX;
      const wordmarkWidth = measure.getBoundingClientRect().width;
      const logoCompact = wordmarkWidth > availableWidth;

      setState((prev) => {
        if (prev && prev.logoCompact === logoCompact) {
          return prev;
        }
        return { logoCompact, navLinksCollapsed: false };
      });
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(row);
    observer.observe(logo);
    observer.observe(center);
    observer.observe(measure);
    const cluster = leftClusterRef?.current;
    if (cluster) observer.observe(cluster);

    window.addEventListener("resize", check);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [
    navRowRef,
    logoRef,
    centerRef,
    wordmarkMeasureRef,
    leftClusterRef,
  ]);

  return state;
}

"use client";

import {
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

const NAV_COLLISION_GAP_PX = 12;

export type NavBarCollisionState = {
  logoCompact: boolean;
  navLinksCollapsed: boolean;
};

export function useNavLogoCompact(
  navRowRef: RefObject<HTMLElement | null>,
  logoRef: RefObject<HTMLElement | null>,
  centerRef: RefObject<HTMLElement | null>,
  wordmarkMeasureRef: RefObject<HTMLElement | null>,
  leftClusterRef: RefObject<HTMLElement | null> | undefined,
  navLinksRef: RefObject<HTMLElement | null>,
): NavBarCollisionState {
  const [state, setState] = useState<NavBarCollisionState>({
    logoCompact: true,
    navLinksCollapsed: true,
  });

  useLayoutEffect(() => {
    const row = navRowRef.current;
    const logo = logoRef.current;
    const center = centerRef.current;
    const measure = wordmarkMeasureRef.current;
    const navLinks = navLinksRef.current;
    const cluster = leftClusterRef?.current;
    if (!row || !logo || !center || !measure || !navLinks) return;

    const check = () => {
      const logoRect = logo.getBoundingClientRect();
      const centerLeft = center.getBoundingClientRect().left;
      const linksWidth = navLinks.getBoundingClientRect().width;
      const clusterGap = cluster
        ? Number.parseFloat(getComputedStyle(cluster).columnGap || "0") || 0
        : 0;

      // Decide from intrinsic link width so show/hide does not oscillate.
      const navLinksCollapsed =
        logoRect.right + NAV_COLLISION_GAP_PX + linksWidth > centerLeft;

      const afterLogoWidth = navLinksCollapsed ? 0 : linksWidth + clusterGap;
      const availableWidth =
        centerLeft - logoRect.left - afterLogoWidth - NAV_COLLISION_GAP_PX;
      const wordmarkWidth = measure.getBoundingClientRect().width;
      const logoCompact = wordmarkWidth > availableWidth;

      setState((prev) => {
        if (
          prev.logoCompact === logoCompact &&
          prev.navLinksCollapsed === navLinksCollapsed
        ) {
          return prev;
        }
        return { logoCompact, navLinksCollapsed };
      });
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(row);
    observer.observe(logo);
    observer.observe(center);
    observer.observe(measure);
    observer.observe(navLinks);
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
    navLinksRef,
  ]);

  return state;
}

"use client";

import {
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

export type NavBarCollisionState = {
  /** Shorten Add / Filters / Near You labels before touching the logo. */
  chromeCompact: boolean;
  logoCompact: boolean;
  /** People/Places live under search, so they are never collapsed into the menu. */
  navLinksCollapsed: boolean;
};

const GAP_PX = 12;
const MIN_SEARCH_PX = 200;
const MAX_SEARCH_PX = 512;
/** Viewport: action labels collapse at/below this (so 1060 is already compact). */
const CHROME_COMPACT_BELOW_PX = 1100;
const CHROME_EXPAND_ABOVE_PX = 1140;
/** Viewport: wordmark collapses soon after chrome compact. */
const LOGO_COMPACT_BELOW_PX = 1020;
const LOGO_EXPAND_ABOVE_PX = 1060;
/** Extra room required before expanding icon → wordmark (prevents thrash). */
const EXPAND_HYSTERESIS_PX = 32;
/** Rough width of the Beta chip beside the mark. */
const BADGE_PX = 36;

/**
 * Coordinate header chrome density + logo compact mode + search geometry.
 *
 * Collapse order while narrowing: action labels → logo wordmark. Search then
 * fills or centers in the remaining slot (never drives logo compact).
 */
export function useNavBarLayout(
  navRowRef: RefObject<HTMLElement | null>,
  leftClusterRef: RefObject<HTMLElement | null>,
  rightClusterRef: RefObject<HTMLElement | null>,
  centerRef: RefObject<HTMLElement | null>,
  wordmarkMeasureRef: RefObject<HTMLElement | null>,
): NavBarCollisionState | null {
  const [state, setState] = useState<NavBarCollisionState | null>(null);

  useLayoutEffect(() => {
    const row = navRowRef.current;
    const left = leftClusterRef.current;
    const right = rightClusterRef.current;
    const center = centerRef.current;
    const measure = wordmarkMeasureRef.current;
    if (!row || !left || !right || !center || !measure) return;

    let frame = 0;
    let searchFrame = 0;
    let chromeCompact = false;
    let logoCompact = false;
    let densityInitialized = false;

    const syncSearch = () => {
      const rowW = row.clientWidth;
      const leftW = left.offsetWidth;
      const rightW = right.offsetWidth;
      const available = Math.max(0, rowW - leftW - rightW - GAP_PX * 2);

      if (available <= MAX_SEARCH_PX) {
        center.style.left = `${leftW + GAP_PX}px`;
        center.style.right = `${rightW + GAP_PX}px`;
        center.style.width = "auto";
        center.style.transform = "none";
        return;
      }

      const width = MAX_SEARCH_PX;
      const idealLeft = (rowW - width) / 2;
      const minLeft = leftW + GAP_PX;
      const maxLeft = rowW - rightW - GAP_PX - width;
      const clampedLeft = Math.min(Math.max(idealLeft, minLeft), maxLeft);
      center.style.left = `${clampedLeft}px`;
      center.style.right = "auto";
      center.style.width = `${width}px`;
      center.style.transform = "none";
    };

    const syncDensity = () => {
      const vw = window.innerWidth;
      const rowW = row.clientWidth;
      const rightW = right.offsetWidth;
      const wordmarkW = measure.getBoundingClientRect().width;
      const leftWithWordmark = wordmarkW + BADGE_PX;
      const budget = rowW - rightW - MIN_SEARCH_PX - GAP_PX * 2;

      let nextChrome = chromeCompact;
      if (chromeCompact) {
        nextChrome = vw < CHROME_EXPAND_ABOVE_PX;
      } else {
        nextChrome = vw < CHROME_COMPACT_BELOW_PX;
      }

      // Logo: viewport stage, plus budget so wide right chrome can still force it.
      let nextLogo = logoCompact;
      const budgetSaysCompact = logoCompact
        ? leftWithWordmark + EXPAND_HYSTERESIS_PX > budget
        : leftWithWordmark > budget;
      if (logoCompact) {
        nextLogo = vw < LOGO_EXPAND_ABOVE_PX || budgetSaysCompact;
      } else {
        nextLogo = vw < LOGO_COMPACT_BELOW_PX || budgetSaysCompact;
      }
      // Never show the wordmark while chrome is still full — keep the cascade.
      if (!nextChrome) nextLogo = false;

      if (
        densityInitialized &&
        nextChrome === chromeCompact &&
        nextLogo === logoCompact
      ) {
        return;
      }

      densityInitialized = true;
      chromeCompact = nextChrome;
      logoCompact = nextLogo;
      setState({
        chromeCompact,
        logoCompact,
        navLinksCollapsed: false,
      });
    };

    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        syncDensity();
        syncSearch();
      });
    };

    const syncSearchOnly = () => {
      cancelAnimationFrame(searchFrame);
      searchFrame = requestAnimationFrame(syncSearch);
    };

    syncDensity();
    syncSearch();

    const observer = new ResizeObserver(sync);
    observer.observe(row);
    observer.observe(right);
    observer.observe(measure);
    const leftObserver = new ResizeObserver(syncSearchOnly);
    leftObserver.observe(left);
    window.addEventListener("resize", sync);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(searchFrame);
      observer.disconnect();
      leftObserver.disconnect();
      window.removeEventListener("resize", sync);
      center.style.left = "";
      center.style.right = "";
      center.style.width = "";
      center.style.transform = "";
    };
  }, [
    navRowRef,
    leftClusterRef,
    rightClusterRef,
    centerRef,
    wordmarkMeasureRef,
  ]);

  return state;
}

"use client";

import {
  useLayoutEffect,
  useState,
  type RefObject,
} from "react";

const LOGO_COLLISION_GAP_PX = 12;

export function useNavLogoCompact(
  navRowRef: RefObject<HTMLElement | null>,
  logoRef: RefObject<HTMLElement | null>,
  centerRef: RefObject<HTMLElement | null>,
  wordmarkMeasureRef: RefObject<HTMLElement | null>,
) {
  const [compact, setCompact] = useState(true);

  useLayoutEffect(() => {
    const row = navRowRef.current;
    const logo = logoRef.current;
    const center = centerRef.current;
    const measure = wordmarkMeasureRef.current;
    if (!row || !logo || !center || !measure) return;

    const check = () => {
      const logoLeft = logo.getBoundingClientRect().left;
      const centerLeft = center.getBoundingClientRect().left;
      const availableWidth = centerLeft - logoLeft - LOGO_COLLISION_GAP_PX;
      const wordmarkWidth = measure.getBoundingClientRect().width;

      setCompact(wordmarkWidth > availableWidth);
    };

    check();

    const observer = new ResizeObserver(check);
    observer.observe(row);
    observer.observe(logo);
    observer.observe(center);
    observer.observe(measure);

    window.addEventListener("resize", check);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [navRowRef, logoRef, centerRef, wordmarkMeasureRef]);

  return compact;
}

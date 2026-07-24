/**
 * Split-pane map column classes.
 *
 * The shell under these sections uses `flex-1` + an absolutely positioned
 * `.map-panel`. The section must be a flex column on desktop — `lg:block`
 * collapses the shell to 0 height because absolute children don't contribute
 * to parent size.
 */
export const MAP_SPLIT_PANE_DESKTOP =
  "hidden lg:flex lg:flex-1 lg:flex-col lg:p-5";

export const MAP_SPLIT_PANE_MOBILE =
  "order-1 flex min-h-0 flex-1 flex-col p-3 pb-0 sm:p-4 sm:pb-0 lg:order-none lg:p-5";

/** Sticky route-detail / customize map column. */
export const MAP_STICKY_ASIDE =
  "relative z-0 mt-8 flex min-h-0 flex-col p-3 sm:p-4 lg:sticky lg:top-0 lg:mt-0 lg:h-[calc(100dvh-var(--site-header-height,4.5rem))] lg:w-1/2 lg:shrink-0 lg:self-start lg:p-5";

/** Shell inside sticky aside — fixed height on mobile, fill aside on desktop. */
export const MAP_STICKY_SHELL = "relative h-[360px] w-full min-h-0 flex-1 lg:h-auto";

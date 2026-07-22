"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { EarthSpinner } from "@/components/layout/EarthSpinner";

const DEFAULT_MESSAGES = [
  "Contemplating",
  "Meditating",
  "Cultivating Bodhicitta",
  "Gathering the Sangha",
  "Sitting with it",
  "Opening the heart",
  "Charting the path",
  "Loading",
] as const;

interface LoadingScreenProps {
  /** Optional fixed message. When omitted, friendly phrases cycle like Turnstile. */
  message?: string;
  messages?: readonly string[];
  /**
   * page: fixed under the site header (default) — does not shift when nav settles.
   * inline: fill the parent (map pane, list placeholders, admin).
   */
  variant?: "page" | "inline";
  minHeightClassName?: string;
}

export function LoadingScreen({
  message,
  messages = DEFAULT_MESSAGES,
  variant = "page",
  minHeightClassName = "min-h-full h-full",
}: LoadingScreenProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const cycling = !message && messages.length > 1;
  const label = message ?? messages[index] ?? DEFAULT_MESSAGES[0];

  useEffect(() => {
    if (!cycling) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, 2200);
    return () => window.clearInterval(id);
  }, [cycling, messages.length]);

  const copy = (
    <>
      <EarthSpinner />
      <div className="relative flex h-7 w-full max-w-sm items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={label}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{
              duration: reduceMotion ? 0.01 : 0.28,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-sm font-medium tracking-wide text-ink-secondary"
          >
            {label}
            <span className="earth-spinner__ellipsis" aria-hidden>
              …
            </span>
          </motion.p>
        </AnimatePresence>
      </div>
    </>
  );

  if (variant === "page") {
    return (
      <div
        className="loading-screen--page"
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label={label}
      >
        {copy}
      </div>
    );
  }

  return (
    <div
      className={`flex w-full min-h-0 flex-1 flex-col items-center justify-center gap-5 px-6 text-center ${minHeightClassName}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      {copy}
    </div>
  );
}

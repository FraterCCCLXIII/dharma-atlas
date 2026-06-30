"use client";

import type { RefObject } from "react";
import Image from "next/image";
import Link from "next/link";
import { useNavBarLogoCompact } from "@/components/layout/NavBarLogoContext";

interface SiteLogoProps {
  className?: string;
  logoRef?: RefObject<HTMLAnchorElement | null>;
  /**
   * auto: icon when nav is compact or on small screens without nav context.
   * wordmark: full logo at all sizes. icon: globe mark only.
   */
  variant?: "auto" | "wordmark" | "icon";
}

const logoImageClassName = "shrink-0 object-contain";

export function SiteLogo({
  className = "",
  variant = "auto",
  logoRef,
}: SiteLogoProps) {
  const navCompact = useNavBarLogoCompact();

  const showIconOnly =
    variant === "icon" ||
    (variant === "auto" && navCompact === true);

  const showWordmarkOnly =
    variant === "wordmark" ||
    (variant === "auto" && navCompact === false);

  const useBreakpointFallback = variant === "auto" && navCompact === null;

  return (
    <div className={`relative inline-flex shrink-0 items-start ${className}`}>
      <Link
        ref={logoRef}
        href="/"
        aria-label="Dharma Atlas home"
        className="group inline-flex shrink-0 items-center overflow-visible rounded-lg transition hover:opacity-80"
      >
        {showIconOnly || useBreakpointFallback ? (
          <Image
            src="/logo-globe.svg"
            alt=""
            width={255}
            height={255}
            priority
            aria-hidden
            unoptimized
            className={
              showIconOnly
                ? `h-8 w-8 ${logoImageClassName}`
                : `h-8 w-8 sm:hidden ${logoImageClassName}`
            }
          />
        ) : null}
        {showWordmarkOnly || useBreakpointFallback ? (
          <Image
            src="/logo-header.svg"
            alt=""
            width={1650}
            height={250}
            priority
            aria-hidden
            unoptimized
            className={
              showWordmarkOnly
                ? `h-8 w-auto sm:h-9 ${logoImageClassName}`
                : `hidden h-8 w-auto sm:block sm:h-9 ${logoImageClassName}`
            }
          />
        ) : null}
      </Link>
      <span className="-ml-2 -mt-1 rounded-full border border-border bg-surface-muted px-1 py-px text-[8px] font-medium uppercase tracking-wide text-ink-muted">
        Beta
      </span>
    </div>
  );
}

/** Hidden wordmark used to measure whether the full logo fits beside nav controls. */
export function SiteLogoWordmarkMeasure({
  measureRef,
}: {
  measureRef: RefObject<HTMLImageElement | null>;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={measureRef}
      src="/logo-header.svg"
      alt=""
      aria-hidden
      className="pointer-events-none invisible absolute h-9 w-auto max-w-none"
    />
  );
}

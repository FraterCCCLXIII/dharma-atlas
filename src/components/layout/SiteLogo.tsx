"use client";

import Link from "next/link";

interface SiteLogoProps {
  className?: string;
}

export function SiteLogo({ className = "" }: SiteLogoProps) {
  return (
    <Link
      href="/"
      aria-label="Dharma Streams home"
      className={`group inline-flex shrink-0 rounded-lg p-1 transition hover:opacity-80 ${className}`}
    >
      <svg
        width="127"
        height="127"
        viewBox="0 0 127 127"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        className="size-8 text-accent sm:size-9"
      >
        <line
          x1="63.5"
          y1="0"
          x2="63.5"
          y2="127"
          stroke="currentColor"
          strokeWidth="10"
        />
        <line
          x1="127"
          y1="63.5"
          x2="0"
          y2="63.5"
          stroke="currentColor"
          strokeWidth="10"
        />
        <line
          x1="108.372"
          y1="18.628"
          x2="18.628"
          y2="108.372"
          stroke="currentColor"
          strokeWidth="10"
        />
        <line
          x1="108.372"
          y1="108.372"
          x2="18.628"
          y2="18.628"
          stroke="currentColor"
          strokeWidth="10"
        />
      </svg>
    </Link>
  );
}

"use client";

import Link from "next/link";

interface SiteLogoProps {
  className?: string;
}

export function SiteLogo({ className = "" }: SiteLogoProps) {
  return (
    <Link
      href="/"
      className={`group inline-flex shrink-0 rounded-lg px-1 py-1 transition hover:opacity-80 ${className}`}
    >
      <span className="font-[family-name:var(--font-fraunces)] text-lg font-semibold tracking-tight text-brand sm:text-xl">
        Dharma Streams
      </span>
    </Link>
  );
}

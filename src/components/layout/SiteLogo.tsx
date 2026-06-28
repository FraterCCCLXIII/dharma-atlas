"use client";

import Image from "next/image";
import Link from "next/link";

interface SiteLogoProps {
  className?: string;
}

export function SiteLogo({ className = "" }: SiteLogoProps) {
  return (
    <Link
      href="/"
      aria-label="Dharma Streams home"
      className={`group inline-flex shrink-0 items-center rounded-lg transition hover:opacity-80 ${className}`}
    >
      <Image
        src="/logo-mark.svg"
        alt=""
        width={200}
        height={200}
        priority
        aria-hidden
        unoptimized
        className="h-7 w-7 sm:hidden"
      />
      <Image
        src="/logo-header.svg"
        alt=""
        width={1650}
        height={250}
        priority
        aria-hidden
        unoptimized
        className="hidden h-7 w-auto sm:block sm:h-8"
      />
    </Link>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { DetailNav } from "@/components/layout/SiteHeader";

export default function PlaceNotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <DetailNav />
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          Not found
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-fraunces)] text-3xl font-semibold text-ink">
          Place not found
        </h1>
        <p className="mt-3 max-w-md text-sm text-ink-secondary">
          This center may have been removed or the link is incorrect.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
        >
          <ArrowLeft size={18} weight="bold" />
          Back to explore
        </Link>
      </div>
    </div>
  );
}

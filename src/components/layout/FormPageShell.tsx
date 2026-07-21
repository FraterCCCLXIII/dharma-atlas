"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "@phosphor-icons/react";

interface FormPageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Compact layout for embedding inside Manage / Admin shells. */
  embedded?: boolean;
}

export function FormPageShell({
  title,
  description,
  children,
  backHref = "/",
  backLabel = "Back to explore",
  embedded = false,
}: FormPageShellProps) {
  const body = (
    <>
      <Link
        href={backHref}
        className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
      >
        <ArrowLeft size={18} weight="bold" />
        {backLabel}
      </Link>

      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h1>

      {description && (
        <p className="mt-3 text-base leading-relaxed text-ink-secondary">{description}</p>
      )}

      <div className="mt-8">{children}</div>
    </>
  );

  if (embedded) {
    return <div className="max-w-2xl">{body}</div>;
  }

  return (
    <div className="min-h-dvh bg-surface">
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">{body}</main>
    </div>
  );
}

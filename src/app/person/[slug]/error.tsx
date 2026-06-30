"use client";

import Link from "next/link";

export default function PersonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold">
        Could not load this profile
      </h1>
      <p className="mt-2 text-sm text-ink-secondary">{error.message}</p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">
          Try again
        </button>
        <Link href="/people" className="rounded-full border border-border px-4 py-2 text-sm font-medium">
          Back to directory
        </Link>
      </div>
    </div>
  );
}

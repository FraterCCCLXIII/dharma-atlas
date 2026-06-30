"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-ink-secondary">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground"
      >
        Try again
      </button>
    </div>
  );
}

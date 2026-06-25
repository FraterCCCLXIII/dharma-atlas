import Link from "next/link";

export default function TeacherNotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-6 text-center">
      <h1 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
        Teacher not found
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        This profile may have moved or is not in the directory yet.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
      >
        Back to directory
      </Link>
    </div>
  );
}

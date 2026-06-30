import Link from "next/link";
import type { ReactNode } from "react";

export function ManageShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  return (
    <div className="flex min-h-dvh bg-surface text-ink">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface-elevated px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            Dharma Atlas
          </p>
          <p className="mt-1 font-[family-name:var(--font-fraunces)] text-lg font-semibold">
            Your listings
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <Link
            href="/manage"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
          >
            Dashboard
          </Link>
          <Link
            href="/manage/places/new"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
          >
            Add location
          </Link>
          <Link
            href="/claim"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
          >
            Claim existing
          </Link>
        </nav>

        <div className="mt-auto space-y-3 border-t border-border px-2 pt-4">
          <p className="truncate text-xs text-ink-muted">{userEmail}</p>
          <Link
            href="/"
            className="block text-xs text-ink-secondary transition hover:text-ink"
          >
            View public site
          </Link>
          <SignOutButton />
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        const { auth } = await import("@/lib/auth");
        const { headers } = await import("next/headers");
        await auth.api.signOut({ headers: await headers() });
        const { redirect } = await import("next/navigation");
        redirect("/login");
      }}
    >
      <button
        type="submit"
        className="text-xs text-ink-muted transition hover:text-ink"
      >
        Sign out
      </button>
    </form>
  );
}

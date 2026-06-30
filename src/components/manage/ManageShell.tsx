"use client";

import Link from "next/link";
import { List } from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";
import { ManageNavLink } from "@/components/manage/ManageNavLink";
import { authClient } from "@/lib/auth-client";

export function ManageShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-surface text-ink">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-56 shrink-0 flex-col border-r border-border bg-surface-elevated px-4 py-6 transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            Dharma Atlas
          </p>
          <p className="mt-1 font-[family-name:var(--font-fraunces)] text-lg font-semibold">
            Your listings
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <ManageNavLink href="/manage" exact>
            Dashboard
          </ManageNavLink>
          <ManageNavLink href="/manage/places/new">
            Add location
          </ManageNavLink>
          <ManageNavLink href="/claim">Claim existing</ManageNavLink>
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border"
          >
            <List size={20} />
          </button>
          <p className="font-[family-name:var(--font-fraunces)] text-lg font-semibold">
            Manage
          </p>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void authClient.signOut()}
      className="text-xs text-ink-muted transition hover:text-ink"
    >
      Sign out
    </button>
  );
}

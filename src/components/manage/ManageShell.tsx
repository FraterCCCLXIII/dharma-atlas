"use client";

import Link from "next/link";
import { List } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { authClient } from "@/lib/auth-client";

export function ManageShell({
  children,
  userEmail,
}: {
  children: ReactNode;
  userEmail: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const listingsActive =
    pathname === "/manage" || pathname.startsWith("/manage/claim");

  return (
    <div className="flex h-dvh bg-surface text-ink">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-56 shrink-0 flex-col border-r border-border bg-surface-elevated px-4 py-6 transition-transform md:sticky md:top-0 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 shrink-0 px-2">
          <SiteLogo variant="wordmark" size="sm" />
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          <Link
            href="/manage"
            data-active={listingsActive}
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink data-[active=true]:bg-brand/10 data-[active=true]:text-brand"
          >
            Place Listings
          </Link>
        </nav>

        <div className="mt-auto shrink-0 space-y-3 border-t border-border px-2 pt-4">
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border"
          >
            <List size={20} />
          </button>
          <SiteLogo variant="icon" />
          <p className="font-display text-lg font-semibold">Place Listings</p>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
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

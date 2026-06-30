"use client";

import Link from "next/link";
import { List } from "@phosphor-icons/react";
import { useState, type ReactNode } from "react";
import { AdminNavLink } from "@/components/admin/AdminNavLink";
import { SiteLogo } from "@/components/layout/SiteLogo";
import { authClient } from "@/lib/auth-client";

const navItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/places", label: "Locations" },
  { href: "/admin/ontology", label: "Ontology" },
  { href: "/admin/submissions", label: "Submissions" },
  { href: "/admin/claims", label: "Claims" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/backup", label: "Backups", ownerOnly: true },
];

export function AdminShell({
  children,
  pendingSubmissions,
  pendingClaims,
  pendingReports,
  userEmail,
  isOwner = false,
}: {
  children: ReactNode;
  pendingSubmissions: number;
  pendingClaims: number;
  pendingReports: number;
  userEmail: string;
  isOwner?: boolean;
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
          <SiteLogo variant="wordmark" />
          <p className="mt-3 font-display text-lg font-semibold">Admin</p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems
            .filter((item) => !("ownerOnly" in item && item.ownerOnly) || isOwner)
            .map((item) => (
              <AdminNavLink key={item.href} href={item.href} exact={item.exact}>
                {item.label}
                {item.href === "/admin/submissions" && pendingSubmissions > 0 && (
                  <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-foreground">
                    {pendingSubmissions}
                  </span>
                )}
                {item.href === "/admin/claims" && pendingClaims > 0 && (
                  <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-foreground">
                    {pendingClaims}
                  </span>
                )}
                {item.href === "/admin/reports" && pendingReports > 0 && (
                  <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[11px] font-semibold text-brand-foreground">
                    {pendingReports}
                  </span>
                )}
              </AdminNavLink>
            ))}
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
          <SiteLogo variant="icon" />
          <p className="font-display text-lg font-semibold">Admin</p>
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

export { navItems };

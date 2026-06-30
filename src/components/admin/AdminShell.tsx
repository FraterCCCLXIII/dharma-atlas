import Link from "next/link";
import type { ReactNode } from "react";

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
  return (
    <div className="flex min-h-dvh bg-surface text-ink">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface-elevated px-4 py-6">
        <div className="mb-8 px-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink-muted">
            Dharma Streams
          </p>
          <p className="mt-1 font-[family-name:var(--font-fraunces)] text-lg font-semibold">
            Admin
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems
            .filter((item) => !("ownerOnly" in item && item.ownerOnly) || isOwner)
            .map((item) => (
            <AdminNavLink key={item.href} href={item.href} exact={item.exact}>
              {item.label}
              {item.href === "/admin/submissions" && pendingSubmissions > 0 && (
                <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground">
                  {pendingSubmissions}
                </span>
              )}
              {item.href === "/admin/claims" && pendingClaims > 0 && (
                <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground">
                  {pendingClaims}
                </span>
              )}
              {item.href === "/admin/reports" && pendingReports > 0 && (
                <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-foreground">
                  {pendingReports}
                </span>
              )}
            </AdminNavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-4 px-2">
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

function AdminNavLink({
  href,
  exact,
  children,
}: {
  href: string;
  exact?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink data-[active=true]:bg-brand/10 data-[active=true]:text-brand"
    >
      {children}
    </Link>
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
        redirect("/admin/login");
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

export { navItems };

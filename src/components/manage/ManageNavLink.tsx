"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function ManageNavLink({
  href,
  exact,
  children,
}: {
  href: string;
  exact?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      data-active={active}
      className="rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink data-[active=true]:bg-brand/10 data-[active=true]:text-brand"
    >
      {children}
    </Link>
  );
}

"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PublicNav } from "@/components/layout/SiteHeader";

export function PublicSiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideNav =
    pathname.startsWith("/admin") || pathname.startsWith("/manage");

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <PublicNav />
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

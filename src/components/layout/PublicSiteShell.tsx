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
    <>
      <PublicNav />
      {children}
    </>
  );
}

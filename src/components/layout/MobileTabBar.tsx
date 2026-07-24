"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EXPLORE_NAV_LINKS } from "@/lib/explore-nav";

/**
 * iOS-style bottom tabs for primary explore destinations.
 * Shown below `md` where the top entity rail is hidden.
 */
export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-elevated/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid h-[var(--mobile-tab-bar-height)] max-w-lg grid-cols-5">
        {EXPLORE_NAV_LINKS.map(
          ({ href, label, icon: IconComponent, isActive, comingSoon }) => {
            const active = isActive(pathname);
            return (
              <li key={href} className="min-w-0">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  aria-label={
                    comingSoon ? `${label} (coming soon)` : label
                  }
                  className={`flex h-full flex-col items-center justify-center gap-0.5 px-0.5 transition ${
                    active
                      ? "text-brand"
                      : "text-ink-muted active:bg-surface-muted"
                  }`}
                >
                  <span className="relative inline-flex">
                    <IconComponent
                      size={22}
                      weight={active ? "fill" : "bold"}
                      className="shrink-0"
                    />
                    {comingSoon ? (
                      <span
                        className={`absolute -right-1.5 -top-0.5 h-1.5 w-1.5 rounded-full ${
                          active ? "bg-brand" : "bg-accent"
                        }`}
                        aria-hidden
                      />
                    ) : null}
                  </span>
                  <span className="max-w-full truncate text-[10px] font-semibold leading-none tracking-tight">
                    {label}
                  </span>
                </Link>
              </li>
            );
          },
        )}
      </ul>
    </nav>
  );
}

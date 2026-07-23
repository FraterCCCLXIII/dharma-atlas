"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { TraditionNav } from "@/components/traditions/TraditionNav";
import type { TraditionNavNode } from "@/lib/traditions/tree";

export function TraditionsShell({
  forest,
  children,
}: {
  forest: TraditionNavNode[];
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-0 px-4 sm:px-6 lg:gap-10 lg:px-8">
        <aside className="hidden w-60 shrink-0 border-r border-border py-8 pr-6 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">
            <p className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Browse
            </p>
            <TraditionNav forest={forest} />
          </div>
        </aside>

        <div className="min-w-0 flex-1 py-6 lg:py-8">
          <div className="mb-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:text-ink"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={16} weight="bold" /> : <List size={16} weight="bold" />}
              Traditions menu
            </button>
            {mobileOpen ? (
              <div className="mt-3 rounded-2xl border border-border bg-surface-elevated p-3 shadow-[var(--shadow-card)]">
                <TraditionNav
                  forest={forest}
                  onNavigate={() => setMobileOpen(false)}
                />
              </div>
            ) : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { X } from "@phosphor-icons/react";

const STORAGE_KEY = "dharma-atlas-beta-welcome-seen";

export function BetaWelcomeModal() {
  const pathname = usePathname();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const isAdminRoute = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;
    if (localStorage.getItem(STORAGE_KEY) === "1") return;
    setOpen(true);
  }, [isAdminRoute]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open || isAdminRoute) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close welcome dialog"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={dismiss}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-surface-elevated shadow-[var(--shadow-float)] sm:max-w-xl"
      >
        <div className="relative h-56 overflow-hidden sm:h-64 md:h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-buddhas.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_40%]"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.12)_28%,rgba(0,0,0,0.03)_48%,transparent_62%),linear-gradient(0deg,var(--surface-elevated)_0%,color-mix(in_srgb,var(--surface-elevated)_94%,transparent)_8%,color-mix(in_srgb,var(--surface-elevated)_78%,transparent)_16%,color-mix(in_srgb,var(--surface-elevated)_52%,transparent)_26%,color-mix(in_srgb,var(--surface-elevated)_28%,transparent)_36%,color-mix(in_srgb,var(--surface-elevated)_10%,transparent)_44%,transparent_54%)]"
            aria-hidden
          />

          <div className="absolute inset-0 flex items-center justify-center px-8 pt-4">
            <Image
              src="/logo-header-overlay.svg"
              alt=""
              width={1650}
              height={250}
              aria-hidden
              unoptimized
              className="h-10 w-auto max-w-[min(100%,20rem)] brightness-0 invert sm:h-11"
            />
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/45"
            aria-label="Close"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        <div className="-mt-1 space-y-6 px-7 pb-7 pt-0 sm:px-8 sm:pb-8">
          <div className="space-y-3">
            <h2
              id={titleId}
              className="font-display text-xl font-semibold text-ink sm:text-2xl"
            >
              Welcome — we&apos;re still growing
            </h2>
            <div className="space-y-3 text-sm leading-relaxed text-ink-secondary sm:text-base">
              <p>
                Dharma Atlas is an open directory of meditation centers,
                monasteries, and spiritual guides across traditions — built to
                help practitioners find communities near them.
              </p>
              <p>
                We&apos;re in beta, so listings and features are still evolving.
                If something is missing or outdated, you can submit an entry or
                report an issue on any page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
          >
            Start exploring
          </button>
        </div>
      </div>
    </div>
  );
}

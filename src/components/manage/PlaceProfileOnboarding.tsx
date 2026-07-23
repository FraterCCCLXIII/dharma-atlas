"use client";

import { Check, Circle, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { PlaceOnboardingStatus } from "@/lib/manage-place-onboarding";

function dismissKey(placeId: string) {
  return `dharma-atlas:place-onboarding-dismissed:${placeId}`;
}

interface PlaceProfileOnboardingProps {
  status: PlaceOnboardingStatus;
  /** Compact card for the manage dashboard. */
  variant?: "edit" | "dashboard";
}

export function PlaceProfileOnboarding({
  status,
  variant = "edit",
}: PlaceProfileOnboardingProps) {
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(dismissKey(status.placeId)) === "1");
    } catch {
      setDismissed(false);
    }
    setReady(true);
  }, [status.placeId]);

  if (status.isComplete) return null;
  if (!ready) return null;

  if (dismissed) {
    return (
      <button
        type="button"
        onClick={() => {
          try {
            window.localStorage.removeItem(dismissKey(status.placeId));
          } catch {
            // ignore
          }
          setDismissed(false);
        }}
        className="text-left text-xs font-medium text-brand transition hover:text-brand-hover"
      >
        Show checklist ({status.completedCount}/{status.totalCount})
      </button>
    );
  }

  function dismiss() {
    try {
      window.localStorage.setItem(dismissKey(status.placeId), "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  if (variant === "dashboard") {
    return (
      <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Finish your listing</p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {status.placeName} · {status.completedCount} of {status.totalCount} done
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
            aria-label="Dismiss checklist"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${status.percent}%` }}
          />
        </div>
        {status.nextIncomplete ? (
          <Link
            href={status.nextIncomplete.href}
            className="mt-3 inline-flex text-sm font-medium text-brand transition hover:text-brand-hover"
          >
            Next: {status.nextIncomplete.label} →
          </Link>
        ) : null}
      </div>
    );
  }

  return (
    <aside className="rounded-xl border border-brand/20 bg-brand/5 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">Profile checklist</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {status.completedCount}/{status.totalCount} · {status.percent}%
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          aria-label="Dismiss checklist"
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-brand transition-all"
          style={{ width: `${status.percent}%` }}
        />
      </div>

      <ul className="mt-3 space-y-0.5">
        {status.items.map((item) => (
          <li key={item.id}>
            <Link
              href={item.href}
              className="flex items-start gap-2 rounded-lg px-1.5 py-1.5 transition hover:bg-surface-elevated/80"
            >
              <span
                className={`mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  item.complete
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-surface-muted text-ink-muted"
                }`}
              >
                {item.complete ? (
                  <Check size={10} weight="bold" />
                ) : (
                  <Circle size={10} weight="bold" />
                )}
              </span>
              <span className="min-w-0">
                <span
                  className={`block text-xs font-medium leading-snug ${
                    item.complete ? "text-ink-muted line-through" : "text-ink"
                  }`}
                >
                  {item.label}
                </span>
                {!item.complete ? (
                  <span className="block text-[11px] leading-snug text-ink-muted">
                    {item.description}
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {status.nextIncomplete ? (
        <Link
          href={status.nextIncomplete.href}
          className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-brand-foreground transition hover:bg-brand-hover"
        >
          Next: {status.nextIncomplete.label}
        </Link>
      ) : null}
    </aside>
  );
}

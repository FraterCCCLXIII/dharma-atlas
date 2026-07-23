"use client";

import { useState } from "react";
import { PlaceOfferingIcon } from "@/components/place/PlaceOfferingIcon";
import { resolvePlaceOfferings } from "@/lib/place-offerings";

const PREVIEW_COUNT = 6;

export function PlaceOfferingsSection({ offeringIds }: { offeringIds?: string[] }) {
  const offerings = resolvePlaceOfferings(offeringIds);
  const [showAll, setShowAll] = useState(false);

  if (offerings.length === 0) return null;

  const visible = showAll ? offerings : offerings.slice(0, PREVIEW_COUNT);
  const hiddenCount = offerings.length - PREVIEW_COUNT;

  return (
    <section className="space-y-4 border-b border-border pb-10">
      <h2 className="font-display text-xl font-semibold text-ink">What this place offers</h2>
      <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {visible.map((offering) => (
          <li key={offering.id} className="flex items-center gap-3 text-sm text-ink">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center text-ink-secondary">
              <PlaceOfferingIcon name={offering.icon} />
            </span>
            <span>{offering.label}</span>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 ? (
        <button
          type="button"
          onClick={() => setShowAll((current) => !current)}
          className="rounded-xl border border-border bg-surface-elevated px-5 py-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
        >
          {showAll ? "Show less" : `Show all ${offerings.length} offerings`}
        </button>
      ) : null}
    </section>
  );
}

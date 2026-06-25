"use client";

import { ArrowRight, MapPin, Sparkle } from "@phosphor-icons/react";
import { traditionGradient } from "@/lib/places";
import type { Place } from "@/types/place";

interface MapPopoverCardProps {
  place: Place;
  onViewDetails: () => void;
}

export function MapPopoverCard({ place, onViewDetails }: MapPopoverCardProps) {
  const address = place.address?.trim();

  return (
    <div className="map-popover-card">
      <div
        className={`relative h-[72px] bg-gradient-to-br ${traditionGradient(place.tradition)}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_55%)]" />
        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
          <Sparkle size={10} weight="fill" />
          {place.type}
        </span>
      </div>

      <div className="space-y-2.5 p-3">
        <div>
          <h3 className="line-clamp-2 font-[family-name:var(--font-fraunces)] text-sm font-semibold leading-snug text-ink">
            {place.name}
          </h3>
          <p className="mt-1 inline-flex items-start gap-1 text-[11px] text-ink-muted">
            <MapPin size={12} weight="bold" className="mt-0.5 shrink-0 text-brand" />
            <span className="line-clamp-2">
              {address || place.tradition}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onViewDetails}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground transition hover:bg-brand-hover"
        >
          View details
          <ArrowRight size={12} weight="bold" />
        </button>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { MapPin } from "@phosphor-icons/react";
import { cardLiftClassName } from "@/lib/card-styles";
import { traditionGradient } from "@/lib/places";
import type { Place } from "@/types/place";

interface SimilarPlacesProps {
  places: Place[];
}

export function SimilarPlaces({ places }: SimilarPlacesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
          Similar places nearby
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Other centers and temples in the same tradition.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {places.map((place) => (
          <Link
            key={place.id}
            href={`/place/${place.id}`}
            className={`group overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)] ${cardLiftClassName}`}
          >
            <div
              className={`relative h-32 bg-gradient-to-br ${traditionGradient(place.tradition)}`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
              <span className="absolute bottom-3 left-3 rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
                {place.type}
              </span>
            </div>
            <div className="space-y-2 p-4">
              <h3 className="line-clamp-2 font-[family-name:var(--font-fraunces)] text-sm font-semibold leading-snug text-ink group-hover:text-brand">
                {place.name}
              </h3>
              <p className="inline-flex items-center gap-1 text-xs text-ink-muted">
                <MapPin size={12} weight="bold" />
                {place.tradition}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

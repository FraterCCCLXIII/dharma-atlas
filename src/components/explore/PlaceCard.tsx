"use client";

import Link from "next/link";
import { MapPin, Sparkle } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { cardLiftClassName } from "@/lib/card-styles";
import { getPlaceDisplayPhotos } from "@/lib/place-photo";
import { getSchools, traditionGradient } from "@/lib/places";
import { schoolLabel } from "@/lib/schools";
import { useExploreStore } from "@/store/explore-store";
import type { Place } from "@/types/place";

interface PlaceCardProps {
  place: Place;
  index: number;
  showKindBadge?: boolean;
}

export function PlaceCard({ place, index, showKindBadge }: PlaceCardProps) {
  const hoveredId = useExploreStore((s) => s.hoveredId);
  const setHoveredId = useExploreStore((s) => s.setHoveredId);

  const isHovered = hoveredId === place.id;
  const schools = getSchools(place);
  const photos = getPlaceDisplayPhotos(place);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.2) }}
      onMouseEnter={() => setHoveredId(place.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      <Link
        href={`/place/${place.id}`}
        className={`group block overflow-hidden rounded-2xl border bg-surface-elevated text-left shadow-[var(--shadow-card)] ${cardLiftClassName} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
          isHovered ? "border-brand ring-1 ring-brand/20" : "border-border"
        }`}
      >
        <div
          className={`relative flex h-36 items-end bg-gradient-to-br p-4 ${traditionGradient(place.tradition)}`}
        >
          {photos.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photos[0]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span className="relative inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white backdrop-blur-sm">
            <Sparkle size={12} weight="fill" />
            {showKindBadge ? "Location" : place.type}
          </span>
        </div>

        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-[family-name:var(--font-fraunces)] text-base font-semibold leading-snug text-ink group-hover:text-brand">
            {place.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
            <span className="rounded-md bg-surface-muted px-2 py-0.5 font-medium">
              {place.tradition}
            </span>
            {schools.map((school) => (
              <span
                key={school}
                className="rounded-md border border-border px-2 py-0.5 font-medium text-ink-muted"
              >
                {schoolLabel(school)}
              </span>
            ))}
            <span className="inline-flex items-start gap-1 text-ink-muted">
              <MapPin size={14} weight="bold" className="mt-0.5 shrink-0" />
              <span className="line-clamp-1">
                {place.address?.trim() || `${place.lat.toFixed(2)}, ${place.lng.toFixed(2)}`}
              </span>
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

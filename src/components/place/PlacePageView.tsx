"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowSquareOut,
  Compass,
  FlowerLotus,
  MapPin,
  Sparkle,
} from "@phosphor-icons/react";
import { DetailPageActions } from "@/components/report/ReportEntryModal";
import { getPlaceMapsUrls } from "@/lib/place-maps";
import { getSchools, traditionGradient } from "@/lib/places";
import { schoolLabel } from "@/lib/schools";
import type { Place } from "@/types/place";
import { DetailNav } from "@/components/layout/SiteHeader";
import { PlaceContactDetails } from "@/components/place/PlaceContactDetails";
import { SimilarPlaces } from "./SimilarPlaces";

const PlaceSingleMap = dynamic(
  () => import("./PlaceSingleMap").then((m) => m.PlaceSingleMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-2xl bg-surface-muted">
        <p className="text-sm text-ink-muted">Loading map…</p>
      </div>
    ),
  },
);

interface PlacePageViewProps {
  place: Place;
  similar: Place[];
}

export function PlacePageView({ place, similar }: PlacePageViewProps) {
  const maps = getPlaceMapsUrls(place);
  const gradient = traditionGradient(place.tradition);
  const schools = getSchools(place);

  return (
    <div className="min-h-dvh bg-surface">
      <DetailNav />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <div className="relative mb-10">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink sm:absolute sm:left-0 sm:top-1 sm:mb-0 sm:-translate-x-[calc(100%+0.75rem)] lg:-translate-x-[calc(100%+1rem)]"
            aria-label="Back to explore"
          >
            <ArrowLeft size={18} weight="bold" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="grid h-[240px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[360px] sm:gap-3 lg:h-[420px]">
            <div className={`relative col-span-2 row-span-2 bg-gradient-to-br ${gradient}`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
              <div className="absolute bottom-4 left-4 rounded-full bg-black/30 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {place.tradition}
              </div>
            </div>
            <div className={`bg-gradient-to-br ${gradient} opacity-90`} />
            <div className={`bg-gradient-to-br ${gradient} opacity-75`} />
            <div className={`bg-gradient-to-br ${gradient} opacity-85`} />
            <div className={`bg-gradient-to-br ${gradient} opacity-70`} />
          </div>
        </div>

        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
              {place.type}
            </span>
            <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-secondary">
              {place.tradition}
            </span>
            {schools.map((school) => (
              <span
                key={school}
                className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-ink-secondary"
              >
                {schoolLabel(school)}
              </span>
            ))}
            <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-secondary">
              {place.faith}
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {place.name}
          </h1>
          <p className="inline-flex items-start gap-1.5 text-sm text-ink-secondary">
            <MapPin size={16} weight="bold" className="mt-0.5 shrink-0 text-brand" />
            <span>
              {place.address?.trim() || `${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}`}
            </span>
          </p>
          </div>

          <DetailPageActions
            shareTitle={place.name}
            entityType="location"
            entityId={place.id}
            entityName={place.name}
            entityPath={`/place/${place.id}`}
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <div className="space-y-10">
            <section className="space-y-4 border-b border-border pb-10">
              <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink">
                About this place
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-ink-secondary">
                {place.name} is a {place.type.toLowerCase()} in the{" "}
                {place.tradition} tradition, listed under{" "}
                <span className="font-medium text-ink">{place.folder}</span>. Use
                the map below to plan your visit or get directions.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm">
                  <FlowerLotus size={20} weight="duotone" className="text-brand" />
                  <span className="text-ink-secondary">{place.tradition} tradition</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm">
                  <Sparkle size={20} weight="duotone" className="text-accent" />
                  <span className="text-ink-secondary">{place.type}</span>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink">
                Where you&apos;ll find it
              </h2>
              <PlaceSingleMap place={place} />
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)]">
              <div className="space-y-5 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Visit
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink">
                    Plan your visit
                  </p>
                </div>

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Type</dt>
                    <dd className="font-medium text-ink">{place.type}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Tradition</dt>
                    <dd className="text-right font-medium text-ink">{place.tradition}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-muted">Faith</dt>
                    <dd className="font-medium text-ink">{place.faith}</dd>
                  </div>
                </dl>

                <PlaceContactDetails place={place} compact />

                <div className="space-y-2 pt-2">
                  <a
                    href={maps.directions}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
                  >
                    <Compass size={18} weight="bold" />
                    Get directions
                  </a>
                  <a
                    href={maps.search}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                  >
                    <ArrowSquareOut size={18} weight="bold" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <SimilarPlaces places={similar} />
          </section>
        )}
      </main>
    </div>
  );
}

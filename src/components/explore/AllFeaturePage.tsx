"use client";

import Link from "next/link";
import {
  ArrowRight,
  Compass,
  FlowerLotus,
  MapTrifold,
  UsersThree,
} from "@phosphor-icons/react";
import {
  getDirectoryStats,
  getFeaturedPlaces,
  getFeaturedTeachers,
  getTopTraditions,
} from "@/lib/feature-page";
import { traditionMarkerColor } from "@/lib/places";
import { useExploreStore } from "@/store/explore-store";
import type { Place } from "@/types/place";
import type { Teacher } from "@/types/teacher";
import { PlaceCard } from "./PlaceCard";
import { TeacherCard } from "./TeacherCard";

interface AllFeaturePageProps {
  places: Place[];
  teachers: Teacher[];
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-3 shadow-[var(--shadow-card)]">
      <p className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-muted">
        {label}
      </p>
    </div>
  );
}

function BrowseCard({
  href,
  eyebrow,
  title,
  description,
  icon: Icon,
  gradient,
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof MapTrifold;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]"
    >
      <div className={`relative h-36 bg-gradient-to-br ${gradient}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
        <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm">
          <Icon size={22} weight="duotone" />
        </div>
      </div>
      <div className="space-y-2 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand">
          {eyebrow}
        </p>
        <h3 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-ink-secondary">{description}</p>
        <span className="inline-flex items-center gap-1.5 pt-1 text-sm font-semibold text-brand transition group-hover:gap-2.5">
          Start exploring
          <ArrowRight size={16} weight="bold" />
        </span>
      </div>
    </Link>
  );
}

export function AllFeaturePage({ places, teachers }: AllFeaturePageProps) {
  const stats = getDirectoryStats(places, teachers);
  const featuredTeachers = getFeaturedTeachers(teachers);
  const featuredPlaces = getFeaturedPlaces(places);
  const topTraditions = getTopTraditions(places, teachers);

  const exploreTradition = (tradition: string) => {
    useExploreStore.setState({
      query: "",
      traditions: [tradition],
      schools: [],
      types: [],
      faiths: [],
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface-elevated px-6 py-10 shadow-[var(--shadow-card)] sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-soft/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />

        <div className="relative max-w-3xl space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            <FlowerLotus size={14} weight="duotone" className="text-brand" />
            A living directory
          </p>
          <h1 className="font-[family-name:var(--font-fraunces)] text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
            Teachers, temples, and paths of practice
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink-secondary sm:text-lg">
            Dharma Streams brings together meditation centers, monasteries, and
            teachers across traditions — so you can discover where to visit and
            who to learn from in one place.
          </p>
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-3">
          <Stat label="Locations" value={stats.placeCount.toLocaleString()} />
          <Stat label="Teachers" value={stats.teacherCount.toLocaleString()} />
          <Stat
            label="Traditions"
            value={stats.traditionCount.toLocaleString()}
          />
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        <BrowseCard
          href="/locations"
          eyebrow="Places"
          title="Explore locations"
          description="Browse temples, monasteries, and meditation centers on an interactive map."
          icon={MapTrifold}
          gradient="from-teal-700 via-emerald-800 to-stone-900"
        />
        <BrowseCard
          href="/teachers"
          eyebrow="People"
          title="Meet teachers"
          description="Discover guides, lineage holders, and contemporary voices across spiritual paths."
          icon={UsersThree}
          gradient="from-amber-700 via-orange-700 to-stone-900"
        />
      </section>

      {topTraditions.length > 0 && (
        <section className="mt-14 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Browse by tradition
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
                Find your lineage
              </h2>
            </div>
            <Link
              href="/locations"
              className="hidden items-center gap-1 text-sm font-medium text-brand hover:underline sm:inline-flex"
            >
              View all locations
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {topTraditions.map((tradition) => (
              <button
                key={tradition}
                type="button"
                onClick={() => exploreTradition(tradition)}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:text-ink"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: traditionMarkerColor(tradition) }}
                  aria-hidden
                />
                {tradition}
              </button>
            ))}
          </div>
        </section>
      )}

      {featuredTeachers.length > 0 && (
        <section className="mt-14 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Featured teachers
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
                Voices across traditions
              </h2>
            </div>
            <Link
              href="/teachers"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              See all teachers
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {featuredTeachers.map((teacher, index) => (
              <TeacherCard
                key={teacher.slug}
                teacher={teacher}
                index={index}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {featuredPlaces.length > 0 && (
        <section className="mt-14 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Featured locations
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-ink">
                Places worth visiting
              </h2>
            </div>
            <Link
              href="/locations"
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              Open the map
              <Compass size={14} weight="bold" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPlaces.map((place, index) => (
              <PlaceCard key={place.id} place={place} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

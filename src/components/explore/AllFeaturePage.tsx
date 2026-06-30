"use client";

import Link from "next/link";
import {
  ArrowRight,
  Compass,
  MapTrifold,
  UsersThree,
} from "@phosphor-icons/react";
import { cardLiftClassName } from "@/lib/card-styles";
import { PEOPLE_LIST_PATH } from "@/lib/explore-routes";
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
import { HomeHero } from "./HomeHero";
import { PlaceCard } from "./PlaceCard";
import { TeacherCard } from "./TeacherCard";

interface AllFeaturePageProps {
  places: Place[];
  teachers: Teacher[];
}

function BrowseCard({
  href,
  title,
  description,
  icon: Icon,
  gradient,
  imageSrc,
  imageAlt,
}: {
  href: string;
  title: string;
  description: string;
  icon: typeof MapTrifold;
  gradient?: string;
  imageSrc?: string;
  imageAlt?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)] ${cardLiftClassName}`}
    >
      <div className={`relative h-52 ${gradient ? `bg-gradient-to-br ${gradient}` : "bg-surface-muted"}`}>
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={imageAlt ?? ""}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.22),transparent_55%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm">
          <Icon size={22} weight="duotone" />
        </div>
      </div>
      <div className="space-y-2 p-5">
        <h3 className="font-display text-xl font-semibold text-ink">
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
    <>
      <HomeHero stats={stats} />

      <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-8 sm:px-6 lg:px-8 lg:pt-10">
        <section className="grid gap-4 md:grid-cols-2">
        <BrowseCard
          href="/locations"
          title="Explore locations"
          description="Browse temples, monasteries, and meditation centers on an interactive map."
          icon={MapTrifold}
          imageSrc="/browse-locations.png"
          imageAlt="White Buddhist stupa under a blue sky"
        />
        <BrowseCard
          href={PEOPLE_LIST_PATH}
          title="Explore people"
          description="Discover guides, lineage holders, and contemporary voices across spiritual paths."
          icon={UsersThree}
          imageSrc="/browse-people.png"
          imageAlt="Buddhist monk in saffron robes"
        />
        </section>

      {topTraditions.length > 0 && (
        <section className="mt-14 space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                Browse by tradition
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
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
              <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                Featured people
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
                Voices across traditions
              </h2>
            </div>
            <Link
              href={PEOPLE_LIST_PATH}
              className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
            >
              See all people
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
              <p className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                Featured locations
              </p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-ink">
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
    </>
  );
}

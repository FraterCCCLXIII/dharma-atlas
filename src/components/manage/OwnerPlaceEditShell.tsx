"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Icon } from "@phosphor-icons/react";
import {
  CalendarBlank,
  Camera,
  FlowerLotus,
  Info,
  MapPin,
  Megaphone,
  ShareNetwork,
  UsersThree,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { PlaceProfileOnboarding } from "@/components/manage/PlaceProfileOnboarding";
import {
  OWNER_PLACE_EDIT_SECTIONS,
  ownerPlaceEditPath,
  type OwnerPlaceEditSection,
} from "@/lib/manage-place";
import type { PlaceOnboardingStatus } from "@/lib/manage-place-onboarding";
import type { Place } from "@/types/place";

const SECTION_ICONS: Record<OwnerPlaceEditSection, Icon> = {
  details: MapPin,
  about: Info,
  offerings: FlowerLotus,
  socials: ShareNetwork,
  photos: Camera,
  teachers: UsersThree,
  events: CalendarBlank,
  notices: Megaphone,
};

export function OwnerPlaceEditShell({
  place,
  onboarding,
  children,
}: {
  place: Place;
  onboarding: PlaceOnboardingStatus;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const activeSlug =
    OWNER_PLACE_EDIT_SECTIONS.find((section) =>
      pathname.endsWith(`/edit/${section.slug}`),
    )?.slug ?? "details";

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Link
        href="/manage"
        className="text-xs font-medium text-ink-muted transition hover:text-ink"
      >
        ← Place Listings
      </Link>

      <div className="mt-3 flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
        <aside className="flex w-full min-w-0 shrink-0 flex-col gap-4 md:sticky md:top-6 md:w-56 md:overflow-hidden">
          <div className="flex min-w-0 items-center gap-2">
            <h1
              className="min-w-0 truncate font-display text-xl font-semibold text-ink sm:text-2xl"
              title={place.name}
            >
              {place.name}
            </h1>
            {place.isDraft ? (
              <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                Draft
              </span>
            ) : null}
          </div>

          <nav
            aria-label="Edit listing sections"
            className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible"
          >
            {OWNER_PLACE_EDIT_SECTIONS.map((section) => {
              const href = ownerPlaceEditPath(
                place.id,
                section.slug as OwnerPlaceEditSection,
              );
              const active = section.slug === activeSlug;
              const SectionIcon = SECTION_ICONS[section.slug];
              return (
                <Link
                  key={section.slug}
                  href={href}
                  data-active={active}
                  className="inline-flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted hover:text-ink data-[active=true]:bg-brand/10 data-[active=true]:text-brand"
                >
                  <SectionIcon
                    size={18}
                    weight={active ? "fill" : "regular"}
                    className="shrink-0 opacity-80"
                    aria-hidden
                  />
                  {section.label}
                </Link>
              );
            })}
          </nav>

          <PlaceProfileOnboarding status={onboarding} />
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

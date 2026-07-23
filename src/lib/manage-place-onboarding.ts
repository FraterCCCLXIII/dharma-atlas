import {
  ownerPlaceEditPath,
  type OwnerPlaceEditSection,
} from "@/lib/manage-place";
import { hasUploadedPlacePhoto } from "@/lib/place-photo";
import type { Place } from "@/types/place";

export type PlaceOnboardingItemId =
  | "location"
  | "contact"
  | "about"
  | "offerings"
  | "photo"
  | "teacher"
  | "schedule"
  | "socials";

export interface PlaceOnboardingItem {
  id: PlaceOnboardingItemId;
  label: string;
  description: string;
  href: string;
  section: OwnerPlaceEditSection;
  complete: boolean;
}

export interface PlaceOnboardingStatus {
  placeId: string;
  placeName: string;
  items: PlaceOnboardingItem[];
  completedCount: number;
  totalCount: number;
  percent: number;
  isComplete: boolean;
  nextIncomplete: PlaceOnboardingItem | null;
}

export interface PlaceOnboardingCounts {
  teacherCount: number;
  listingCount: number;
  socialCount?: number;
}

interface OnboardingRule {
  id: PlaceOnboardingItemId;
  label: string;
  description: string;
  section: OwnerPlaceEditSection;
  isComplete: (place: Place, counts: PlaceOnboardingCounts) => boolean;
}

const ONBOARDING_RULES: OnboardingRule[] = [
  {
    id: "location",
    label: "Location",
    description: "Name and street address",
    section: "details",
    isComplete: (place) =>
      Boolean(place.name?.trim() && place.address?.trim()),
  },
  {
    id: "contact",
    label: "Contact",
    description: "Phone or website",
    section: "details",
    isComplete: (place) =>
      Boolean(place.phone?.trim() || place.website?.trim()),
  },
  {
    id: "socials",
    label: "Social links",
    description: "A profile visitors can follow",
    section: "socials",
    isComplete: (_place, counts) => (counts.socialCount ?? 0) > 0,
  },
  {
    id: "about",
    label: "About",
    description: "A short public description",
    section: "about",
    isComplete: (place) => (place.description?.trim().length ?? 0) >= 40,
  },
  {
    id: "offerings",
    label: "Offerings",
    description: "What visitors can find here",
    section: "offerings",
    isComplete: (place) => (place.offerings?.length ?? 0) > 0,
  },
  {
    id: "photo",
    label: "Photo",
    description: "At least one uploaded image",
    section: "photos",
    isComplete: (place) => hasUploadedPlacePhoto(place),
  },
  {
    id: "teacher",
    label: "Guiding teacher",
    description: "Someone who leads practice here",
    section: "teachers",
    isComplete: (_place, counts) => counts.teacherCount > 0,
  },
  {
    id: "schedule",
    label: "Scheduled events",
    description: "A recurring practice time or upcoming event",
    section: "events",
    isComplete: (_place, counts) => counts.listingCount > 0,
  },
];

/** Build a profile-completeness checklist (not a mirror of edit nav labels). */
export function getPlaceOnboardingStatus(
  place: Place,
  counts: PlaceOnboardingCounts,
): PlaceOnboardingStatus {
  const items = ONBOARDING_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    description: rule.description,
    section: rule.section,
    href: ownerPlaceEditPath(place.id, rule.section),
    complete: rule.isComplete(place, counts),
  }));

  const completedCount = items.filter((item) => item.complete).length;
  const totalCount = items.length;
  const percent = totalCount === 0 ? 100 : Math.round((completedCount / totalCount) * 100);

  return {
    placeId: place.id,
    placeName: place.name,
    items,
    completedCount,
    totalCount,
    percent,
    isComplete: completedCount === totalCount,
    nextIncomplete: items.find((item) => !item.complete) ?? null,
  };
}

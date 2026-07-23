import { filterKnownOfferings } from "@/lib/place-offerings";
import { getSubschoolLabelMap } from "@/lib/schools";
import type { OwnerPlaceEditInput } from "@/lib/validations/owner-place";
import type { Place } from "@/types/place";

export const OWNER_PLACE_EDIT_SECTIONS = [
  { slug: "details", label: "Details", description: "Name, type, address, and contact" },
  { slug: "about", label: "About", description: "Public description" },
  { slug: "offerings", label: "Offerings", description: "What this place offers" },
  { slug: "socials", label: "Social Links", description: "Profiles visitors can follow" },
  { slug: "photos", label: "Photos", description: "Cover and gallery images" },
  { slug: "teachers", label: "Teachers", description: "Guiding teachers" },
  { slug: "events", label: "Scheduled Events", description: "Recurring practice and special events" },
  { slug: "notices", label: "Notices", description: "Visitor notice above About" },
] as const;

export type OwnerPlaceEditSection = (typeof OWNER_PLACE_EDIT_SECTIONS)[number]["slug"];

export function ownerPlaceEditPath(placeId: string, section: OwnerPlaceEditSection = "details") {
  return `/manage/places/${placeId}/edit/${section}`;
}

export function isOwnerPlaceEditSection(value: string): value is OwnerPlaceEditSection {
  return OWNER_PLACE_EDIT_SECTIONS.some((section) => section.slug === value);
}

export function placeToOwnerEditInput(place: Place): OwnerPlaceEditInput {
  const hoursLines = place.openingHours?.weekdayDescriptions?.join("\n") ?? "";
  const knownSlugs = new Set(Object.keys(getSubschoolLabelMap()));
  return {
    name: place.name,
    slug: place.slug || place.id,
    type: place.type,
    faith: place.faith,
    tradition: place.tradition,
    locationMode: place.locationMode ?? "venue",
    address: place.address,
    phone: place.phone ?? null,
    website: place.website ?? null,
    description: place.description ?? null,
    notice: place.notice ?? null,
    hoursText: hoursLines || null,
    schools: (place.schools ?? []).filter((slug) => knownSlugs.has(slug)),
    offerings: filterKnownOfferings(place.offerings ?? []),
  };
}

export function safeOwnerPlaceReturnTo(placeId: string, returnTo: string | null | undefined) {
  const fallback = ownerPlaceEditPath(placeId, "details");
  if (!returnTo) return fallback;
  const prefix = `/manage/places/${placeId}/edit`;
  if (returnTo === prefix || returnTo.startsWith(`${prefix}/`)) {
    return returnTo;
  }
  return fallback;
}

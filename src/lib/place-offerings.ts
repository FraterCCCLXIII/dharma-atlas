export const PLACE_OFFERING_IDS = [
  "sitting-meditation",
  "walking-meditation",
  "chanting",
  "dharma-talks",
  "study-classes",
  "retreats",
  "beginner-friendly",
  "online-livestream",
  "residential",
  "family-youth",
  "community-meals",
  "guest-lodging",
  "library-bookstore",
  "parking",
  "wheelchair-accessible",
  "lgbtq-welcoming",
  "silent-practice",
  "yoga-movement",
] as const;

export type PlaceOfferingId = (typeof PLACE_OFFERING_IDS)[number];

export type PlaceOfferingIcon =
  | "lotus"
  | "walk"
  | "music"
  | "chats"
  | "book"
  | "moon"
  | "sparkle"
  | "broadcast"
  | "house"
  | "users"
  | "fork"
  | "bed"
  | "books"
  | "car"
  | "wheelchair"
  | "heart"
  | "quiet"
  | "person";

export interface PlaceOfferingDef {
  id: PlaceOfferingId;
  label: string;
  description?: string;
  icon: PlaceOfferingIcon;
}

/** Curated practice & visitor offerings for dharma place profiles. */
export const PLACE_OFFERINGS: PlaceOfferingDef[] = [
  { id: "sitting-meditation", label: "Sitting meditation", icon: "lotus" },
  { id: "walking-meditation", label: "Walking meditation", icon: "walk" },
  { id: "chanting", label: "Chanting & liturgy", icon: "music" },
  { id: "dharma-talks", label: "Dharma talks", icon: "chats" },
  { id: "study-classes", label: "Study & classes", icon: "book" },
  { id: "retreats", label: "Retreats", icon: "moon" },
  { id: "beginner-friendly", label: "Beginner-friendly", icon: "sparkle" },
  { id: "online-livestream", label: "Online / livestream", icon: "broadcast" },
  { id: "residential", label: "Residential practice", icon: "house" },
  { id: "family-youth", label: "Family & youth programs", icon: "users" },
  { id: "community-meals", label: "Community meals", icon: "fork" },
  { id: "guest-lodging", label: "Guest lodging", icon: "bed" },
  { id: "library-bookstore", label: "Library / bookstore", icon: "books" },
  { id: "parking", label: "Parking available", icon: "car" },
  { id: "wheelchair-accessible", label: "Wheelchair accessible", icon: "wheelchair" },
  { id: "lgbtq-welcoming", label: "LGBTQ+ welcoming", icon: "heart" },
  { id: "silent-practice", label: "Periods of silence", icon: "quiet" },
  { id: "yoga-movement", label: "Yoga / movement", icon: "person" },
];

const OFFERING_BY_ID = new Map(PLACE_OFFERINGS.map((item) => [item.id, item]));

export function isPlaceOfferingId(value: string): value is PlaceOfferingId {
  return OFFERING_BY_ID.has(value as PlaceOfferingId);
}

export function filterKnownOfferings(ids: string[]): PlaceOfferingId[] {
  return [...new Set(ids.filter(isPlaceOfferingId))];
}

export function resolvePlaceOfferings(ids: string[] | undefined | null): PlaceOfferingDef[] {
  if (!ids?.length) return [];
  return filterKnownOfferings(ids)
    .map((id) => OFFERING_BY_ID.get(id))
    .filter((item): item is PlaceOfferingDef => Boolean(item));
}

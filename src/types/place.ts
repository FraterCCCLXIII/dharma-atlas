export type Faith = "Buddhist" | "Hindu";
export type PlaceType =
  | "Center"
  | "Temple"
  | "Monastery"
  | "Meditation Center"
  | "Institute"
  | "Ashram"
  | "Sangha"
  | "Historic Site"
  | "Sacred Landscape";

/** How a listing’s location is stored and shown publicly. */
export type LocationMode = "venue" | "area" | "online";

export type CoordPrecision = "pin" | "address" | "city" | "region" | "unknown";

export type PhotoSource =
  | "website"
  | "google_places"
  | "wikimedia"
  | "osm"
  | "generated"
  | "admin";

export const MAX_PLACE_PHOTOS = 5;

export interface PlaceOpeningHours {
  weekdayDescriptions?: string[];
  openNow?: boolean;
  source?: "google_places";
}

export interface PlacePhoto {
  id: number;
  path: string;
  photoSource?: PhotoSource;
  sortOrder: number;
}

/** @deprecated Use PlaceScheduleRule on kind=schedule rows. */
export type PlaceEventRecurrence = "weekly" | "monthly";

export type PlaceEventKind = "event" | "schedule";

/** 0 = Sunday … 6 = Saturday. */
export type PlaceWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** 1–4 = nth weekday of month; -1 = last. */
export type PlaceMonthWeek = 1 | 2 | 3 | 4 | -1;

export type PlaceScheduleRule =
  | { freq: "weekly"; daysOfWeek: PlaceWeekday[] }
  | { freq: "monthlyNth"; week: PlaceMonthWeek; weekday: PlaceWeekday };

/** Social profile link on a place (YouTube, Instagram, Facebook, X, etc.). */
export interface PlaceSocial {
  id: number;
  placeId: string;
  platform: string;
  url: string;
  /** Custom label when platform is "other". */
  label?: string;
  sortOrder: number;
}

/** Guiding teacher listed on a place profile (may later link to a full teacher). */
export interface PlaceTeacher {
  id: number;
  placeId: string;
  displayName: string;
  title?: string;
  /** Short bio shown in a modal on the public place page. */
  bio?: string;
  imagePath?: string;
  teacherSlug?: string;
  sortOrder: number;
}

export interface PlaceEvent {
  id: number;
  placeId: string;
  kind: PlaceEventKind;
  title: string;
  description?: string;
  /** ISO timestamp — required for kind=event */
  startsAt?: string;
  /** ISO timestamp */
  endsAt?: string;
  /** HH:mm wall time — required for kind=schedule */
  startTime?: string;
  endTime?: string;
  rule?: PlaceScheduleRule;
  timezone: string;
  url?: string;
  externalUid?: string;
  sourceType?: "manual" | "ics" | "csv";
  isCancelled: boolean;
}

export interface PlaceCalendarSource {
  id: number;
  placeId: string;
  type: "ics";
  url: string;
  label?: string;
  lastSyncedAt?: string;
  lastError?: string;
}

/** Expanded occurrence for calendar/list display. */
export interface PlaceEventOccurrence {
  event: PlaceEvent;
  startsAt: string;
  endsAt?: string;
}

/** Slim place row for explore list cards and map popovers. */
export interface PlaceMarker {
  id: string;
  /** Public URL segment; falls back to id when absent. */
  slug?: string;
  name: string;
  lat: number;
  lng: number;
  tradition: string;
  /** Manually curated school slugs when lineage is not in the place name. */
  schools?: string[];
  faith: Faith;
  type: PlaceType;
  address: string;
  locationMode?: LocationMode;
  photo?: string;
}

/**
 * Map pin only — no name/photo/address so viewport fetches stay small.
 * Popovers load a PlaceMarker card on demand.
 */
export interface ExploreMapPin {
  id: string;
  slug?: string;
  lat: number;
  lng: number;
  tradition: string;
  faith: Faith;
  type: PlaceType;
  locationMode?: LocationMode;
}

export interface Place {
  id: string;
  /** Public URL segment. Always set for DB rows; may be absent on seed JSON. */
  slug?: string;
  name: string;
  lat: number;
  lng: number;
  tradition: string;
  /** Manually curated school slugs when lineage is not in the place name. */
  schools?: string[];
  /** Practice & visitor offering ids (see place-offerings catalog). */
  offerings?: string[];
  faith: Faith;
  type: PlaceType;
  folder: string;
  address: string;
  phone: string | null;
  website: string | null;
  description?: string;
  descriptionSource?: string;
  /** Short visitor-facing notice shown above About. */
  notice?: string;
  /** venue = street address; area = city/region only; online = no fixed venue. */
  locationMode?: LocationMode;
  coordPrecision?: CoordPrecision;
  dataSource?: string;
  verifiedAt?: string;
  verifiedFields?: string[];
  qualityFlags?: string[];
  photo?: string;
  photoSource?: PhotoSource;
  /** Gallery images (up to 5). Cover photo is the first entry. */
  photos?: PlacePhoto[];
  googlePlaceId?: string;
  googleMapsUri?: string;
  openingHours?: PlaceOpeningHours;
  googleRating?: number;
  googleRatingCount?: number;
  businessStatus?: string;
  googlePrimaryType?: string;
  isDraft?: boolean;
  /** Set when a member requests admin publish for a draft listing. */
  publishRequestedAt?: string;
  /** True when this place is in the pilgrimage catalog / route graph. */
  isPilgrimageSite?: boolean;
  /** Stable catalog slug used for seeding and pilgrimage URL redirects. */
  pilgrimageSlug?: string;
  /** Soft-delete timestamp; present when owner removed the listing. */
  deletedAt?: string;
}

export interface PlacesDataset {
  source: string;
  sourceName: string;
  sourceCredit: string;
  count: number;
  places: Place[];
}

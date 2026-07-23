import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export * from "./auth-schema";

export const places = pgTable(
  "places",
  {
    id: text("id").primaryKey(),
    /** Public URL segment (`/place/[slug]`). Stable id remains the PK. */
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    lat: doublePrecision("lat").notNull(),
    lng: doublePrecision("lng").notNull(),
    tradition: text("tradition").notNull(),
    faith: text("faith").notNull(),
    type: text("type").notNull(),
    folder: text("folder").notNull().default(""),
    address: text("address").notNull().default(""),
    phone: text("phone"),
    website: text("website"),
    schools: text("schools").array().notNull().default([]),
    /** Practice & visitor offerings shown on the public profile. */
    offerings: text("offerings").array().notNull().default([]),
    description: text("description"),
    descriptionSource: text("description_source"),
    /** Short visitor-facing notice shown above About on the public profile. */
    notice: text("notice"),
    /**
     * How location is shown: venue (street + pin), area (city/region only),
     * online (no map pin).
     */
    locationMode: text("location_mode").notNull().default("venue"),
    coordPrecision: text("coord_precision").notNull().default("unknown"),
    dataSource: text("data_source"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    verifiedFields: text("verified_fields").array().notNull().default([]),
    qualityFlags: text("quality_flags").array().notNull().default([]),
    photo: text("photo"),
    photoSource: text("photo_source"),
    googlePlaceId: text("google_place_id"),
    googleMapsUri: text("google_maps_uri"),
    openingHours: text("opening_hours"),
    googleRating: doublePrecision("google_rating"),
    googleRatingCount: integer("google_rating_count"),
    businessStatus: text("business_status"),
    googlePrimaryType: text("google_primary_type"),
    isDraft: boolean("is_draft").notNull().default(false),
    publishRequestedAt: timestamp("publish_requested_at", { withTimezone: true }),
    /**
     * True when this place is part of the pilgrimage catalog / can appear on routes.
     * Explore stays open to all places; pilgrimage UIs filter on this flag.
     */
    isPilgrimageSite: boolean("is_pilgrimage_site").notNull().default(false),
    /**
     * Stable key from the static pilgrimage catalog (`PILGRIMAGE_SITES[].slug`).
     * Used for idempotent seeding and optional redirects from `/pilgrimage/sites/[slug]`.
     */
    pilgrimageSlug: text("pilgrimage_slug"),
    /** Soft-delete timestamp; null means active. */
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("places_slug_uidx").on(table.slug),
    uniqueIndex("places_pilgrimage_slug_uidx").on(table.pilgrimageSlug),
    index("places_draft_name_idx").on(table.isDraft, table.name),
    index("places_deleted_at_idx").on(table.deletedAt),
    index("places_is_pilgrimage_site_idx").on(table.isPilgrimageSite),
  ],
);

export const placePhotos = pgTable(
  "place_photos",
  {
    id: serial("id").primaryKey(),
    placeId: text("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    path: text("path").notNull(),
    photoSource: text("photo_source"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("place_photos_place_idx").on(table.placeId)],
);

export const teachers = pgTable("teachers", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  tradition: text("tradition").notNull(),
  lineage: text("lineage").notNull(),
  location: text("location").notNull(),
  base: text("base"),
  yearsTeaching: integer("years_teaching").notNull().default(0),
  birthYear: integer("birth_year"),
  deathYear: integer("death_year"),
  languages: text("languages").array().notNull().default([]),
  shortBio: text("short_bio").notNull().default(""),
  biography: text("biography").array().notNull().default([]),
  topics: text("topics").array().notNull().default([]),
  photo: text("photo").notNull().default(""),
  heroPhoto: text("hero_photo"),
  website: text("website"),
  isDraft: boolean("is_draft").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const teacherBooks = pgTable("teacher_books", {
  id: serial("id").primaryKey(),
  teacherSlug: text("teacher_slug")
    .notNull()
    .references(() => teachers.slug, { onDelete: "cascade" }),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  publisher: text("publisher").notNull(),
  url: text("url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const teacherRetreats = pgTable("teacher_retreats", {
  id: serial("id").primaryKey(),
  teacherSlug: text("teacher_slug")
    .notNull()
    .references(() => teachers.slug, { onDelete: "cascade" }),
  title: text("title").notNull(),
  dates: text("dates").notNull(),
  location: text("location").notNull(),
  price: text("price"),
});

export const teacherSocials = pgTable("teacher_socials", {
  id: serial("id").primaryKey(),
  teacherSlug: text("teacher_slug")
    .notNull()
    .references(() => teachers.slug, { onDelete: "cascade" }),
  label: text("label").notNull(),
  url: text("url").notNull(),
});

export const teacherRelations = pgTable("teacher_relations", {
  id: serial("id").primaryKey(),
  fromSlug: text("from_slug")
    .notNull()
    .references(() => teachers.slug, { onDelete: "cascade" }),
  toSlug: text("to_slug"),
  name: text("name").notNull(),
  role: text("role").notNull(),
  note: text("note"),
  type: text("type").notNull(),
});

/** Social profile links for a place (YouTube, Instagram, Facebook, X, etc.). */
export const placeSocials = pgTable(
  "place_socials",
  {
    id: serial("id").primaryKey(),
    placeId: text("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    /** youtube | instagram | facebook | x | tiktok | linkedin | other */
    platform: text("platform").notNull(),
    url: text("url").notNull(),
    /** Optional custom label when platform is "other". */
    label: text("label"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("place_socials_place_idx").on(table.placeId)],
);

/** Guiding teachers shown on a place profile (stubs or linked full teacher profiles). */
export const placeTeachers = pgTable(
  "place_teachers",
  {
    id: serial("id").primaryKey(),
    placeId: text("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    title: text("title"),
    bio: text("bio"),
    imagePath: text("image_path"),
    teacherSlug: text("teacher_slug").references(() => teachers.slug, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("place_teachers_place_idx").on(table.placeId),
    index("place_teachers_teacher_idx").on(table.teacherSlug),
  ],
);

/** One-time events and standing practice schedules owned by a place. */
export const placeEvents = pgTable(
  "place_events",
  {
    id: serial("id").primaryKey(),
    placeId: text("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    /** event = dated one-time; schedule = repeating day/time rule. */
    kind: text("kind").notNull().default("event"),
    title: text("title").notNull(),
    description: text("description"),
    /** Required for kind=event. */
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    /** Wall-clock HH:mm for kind=schedule. */
    startTime: text("start_time"),
    endTime: text("end_time"),
    /** Structured recurrence for kind=schedule (weekly days / monthly nth weekday). */
    rule: jsonb("rule"),
    timezone: text("timezone").notNull().default("America/Los_Angeles"),
    url: text("url"),
    /** @deprecated Legacy simple recurrence; migrated into kind/rule. */
    recurrence: text("recurrence"),
    /** Stable id from ICS UID / CSV row hash for sync upserts. */
    externalUid: text("external_uid"),
    /** manual | ics | csv */
    sourceType: text("source_type"),
    isCancelled: boolean("is_cancelled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("place_events_place_idx").on(table.placeId),
    index("place_events_starts_at_idx").on(table.startsAt),
  ],
);

/** External calendar feeds connected to a place (ICS for v1). */
export const placeCalendarSources = pgTable(
  "place_calendar_sources",
  {
    id: serial("id").primaryKey(),
    placeId: text("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("ics"),
    url: text("url").notNull(),
    label: text("label"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("place_calendar_sources_place_idx").on(table.placeId)],
);

export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  entryType: text("entry_type").notNull(),
  status: text("status").notNull().default("pending"),
  submitterName: text("submitter_name").notNull(),
  submitterEmail: text("submitter_email").notNull(),
  name: text("name").notNull(),
  location: text("location"),
  website: text("website"),
  notes: text("notes"),
  payload: jsonb("payload"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PlaceRow = typeof places.$inferSelect;
export type TeacherRow = typeof teachers.$inferSelect;
export type SubmissionRow = typeof submissions.$inferSelect;

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  entityName: text("entity_name").notNull(),
  entityPath: text("entity_path").notNull(),
  reason: text("reason").notNull(),
  details: text("details"),
  submitterEmail: text("submitter_email").notNull(),
  status: text("status").notNull().default("pending"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ReportRow = typeof reports.$inferSelect;

export const ontologyNodes = pgTable("ontology_nodes", {
  slug: text("slug").primaryKey(),
  label: text("label").notNull(),
  parentSlug: text("parent_slug"),
  sortOrder: integer("sort_order").notNull().default(0),
  nodeType: text("node_type").notNull(),
  filterId: text("filter_id").notNull(),
  placeTraditions: text("place_traditions").array().notNull().default([]),
  inferPattern: text("infer_pattern"),
  appliesToLocations: boolean("applies_to_locations").notNull().default(true),
  appliesToPeople: boolean("applies_to_people").notNull().default(true),
  defaultImagePath: text("default_image_path"),
});

export type OntologyNodeRow = typeof ontologyNodes.$inferSelect;

export const placeMemberships = pgTable(
  "place_memberships",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    placeId: text("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("manager"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("place_memberships_user_place_idx").on(table.userId, table.placeId),
    index("place_memberships_place_idx").on(table.placeId),
  ],
);

export const claims = pgTable(
  "claims",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    placeId: text("place_id").references(() => places.id, { onDelete: "set null" }),
    teacherSlug: text("teacher_slug"),
    entityType: text("entity_type").notNull().default("place"),
    placeName: text("place_name").notNull(),
    listingUrl: text("listing_url"),
    affiliationRole: text("affiliation_role").notNull(),
    message: text("message").notNull(),
    status: text("status").notNull().default("pending"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("claims_status_idx").on(table.status),
    index("claims_user_idx").on(table.userId),
    index("claims_place_idx").on(table.placeId),
  ],
);

export type PlaceMembershipRow = typeof placeMemberships.$inferSelect;
export type ClaimRow = typeof claims.$inferSelect;

export const placeFavorites = pgTable(
  "place_favorites",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    placeId: text("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("place_favorites_user_place_idx").on(table.userId, table.placeId),
    index("place_favorites_user_idx").on(table.userId),
    index("place_favorites_place_idx").on(table.placeId),
  ],
);

export type PlaceFavoriteRow = typeof placeFavorites.$inferSelect;

/** Saved pilgrimage sites/routes (canonical catalog slugs; no FK to static data). */
export const pilgrimageFavorites = pgTable(
  "pilgrimage_favorites",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    /** `site` | `route` */
    kind: text("kind").notNull(),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("pilgrimage_favorites_user_kind_slug_idx").on(
      table.userId,
      table.kind,
      table.slug,
    ),
    index("pilgrimage_favorites_user_idx").on(table.userId),
  ],
);

export type PilgrimageFavoriteRow = typeof pilgrimageFavorites.$inferSelect;

/** User-created or forked pilgrimage itineraries. */
export const userPilgrimageRoutes = pgTable(
  "user_pilgrimage_routes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    /** Canonical route this was forked from, if any. */
    baseRouteSlug: text("base_route_slug"),
    stopSlugs: jsonb("stop_slugs").$type<string[]>().notNull(),
    /** Unlisted public share token (`/pilgrimage/r/[shareId]`). */
    shareId: text("share_id").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("user_pilgrimage_routes_share_id_idx").on(table.shareId),
    index("user_pilgrimage_routes_user_idx").on(table.userId),
  ],
);

export type UserPilgrimageRouteRow = typeof userPilgrimageRoutes.$inferSelect;

/** Canonical pilgrimage circuits (seeded from the static catalog). */
export const pilgrimageRoutes = pgTable("pilgrimage_routes", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  region: text("region").notNull(),
  tradition: text("tradition").notNull(),
  summary: text("summary").notNull(),
  lengthNote: text("length_note").notNull(),
  significance: text("significance"),
  /** Named stops that are not yet linked place rows. */
  extraStops: jsonb("extra_stops").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PilgrimageRouteRow = typeof pilgrimageRoutes.$inferSelect;

/** Ordered stops on a canonical pilgrimage route. */
export const pilgrimageRouteStops = pgTable(
  "pilgrimage_route_stops",
  {
    id: serial("id").primaryKey(),
    routeSlug: text("route_slug")
      .notNull()
      .references(() => pilgrimageRoutes.slug, { onDelete: "cascade" }),
    placeId: text("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    /** Official temple number on a numbered circuit (e.g. Shikoku henro). */
    templeNumber: integer("temple_number"),
  },
  (table) => [
    uniqueIndex("pilgrimage_route_stops_route_place_uidx").on(
      table.routeSlug,
      table.placeId,
    ),
    uniqueIndex("pilgrimage_route_stops_route_position_uidx").on(
      table.routeSlug,
      table.position,
    ),
    index("pilgrimage_route_stops_place_idx").on(table.placeId),
  ],
);

export type PilgrimageRouteStopRow = typeof pilgrimageRouteStops.$inferSelect;

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

export const places = pgTable("places", {
  id: text("id").primaryKey(),
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
  description: text("description"),
  descriptionSource: text("description_source"),
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
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

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

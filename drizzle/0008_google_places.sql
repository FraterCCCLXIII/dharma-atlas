ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "google_place_id" text;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "google_maps_uri" text;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "opening_hours" text;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "google_rating" double precision;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "google_rating_count" integer;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "business_status" text;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "google_primary_type" text;

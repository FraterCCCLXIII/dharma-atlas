ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "description" text;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "description_source" text;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "coord_precision" text DEFAULT 'unknown' NOT NULL;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "data_source" text;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "verified_at" timestamp with time zone;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "verified_fields" text[] DEFAULT '{}' NOT NULL;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "quality_flags" text[] DEFAULT '{}' NOT NULL;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "photo" text;
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "photo_source" text;

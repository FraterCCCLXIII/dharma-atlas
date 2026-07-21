ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone;
CREATE INDEX IF NOT EXISTS "places_deleted_at_idx" ON "places" ("deleted_at");

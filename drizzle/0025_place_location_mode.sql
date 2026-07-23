ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "location_mode" text DEFAULT 'venue' NOT NULL;

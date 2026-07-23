ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "offerings" text[] DEFAULT '{}' NOT NULL;

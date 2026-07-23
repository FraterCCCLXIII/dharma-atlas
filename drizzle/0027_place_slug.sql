ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "slug" text;
--> statement-breakpoint
UPDATE "places" SET "slug" = "id" WHERE "slug" IS NULL OR "slug" = '';
--> statement-breakpoint
ALTER TABLE "places" ALTER COLUMN "slug" SET NOT NULL;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "places_slug_uidx" ON "places" USING btree ("slug");

ALTER TABLE "place_events" ADD COLUMN IF NOT EXISTS "external_uid" text;
--> statement-breakpoint
ALTER TABLE "place_events" ADD COLUMN IF NOT EXISTS "source_type" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "place_calendar_sources" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"type" text DEFAULT 'ics' NOT NULL,
	"url" text NOT NULL,
	"label" text,
	"last_synced_at" timestamp with time zone,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "place_calendar_sources" ADD CONSTRAINT "place_calendar_sources_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_calendar_sources_place_idx" ON "place_calendar_sources" USING btree ("place_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "place_events_place_external_uid_uidx" ON "place_events" USING btree ("place_id","external_uid") WHERE "external_uid" IS NOT NULL;

ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "is_pilgrimage_site" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "pilgrimage_slug" text;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pilgrimage_routes" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"region" text NOT NULL,
	"tradition" text NOT NULL,
	"summary" text NOT NULL,
	"length_note" text NOT NULL,
	"significance" text,
	"extra_stops" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pilgrimage_route_stops" (
	"id" serial PRIMARY KEY NOT NULL,
	"route_slug" text NOT NULL,
	"place_id" text NOT NULL,
	"position" integer NOT NULL,
	"temple_number" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pilgrimage_route_stops" ADD CONSTRAINT "pilgrimage_route_stops_route_slug_pilgrimage_routes_slug_fk" FOREIGN KEY ("route_slug") REFERENCES "public"."pilgrimage_routes"("slug") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pilgrimage_route_stops" ADD CONSTRAINT "pilgrimage_route_stops_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "places_pilgrimage_slug_uidx" ON "places" USING btree ("pilgrimage_slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "places_is_pilgrimage_site_idx" ON "places" USING btree ("is_pilgrimage_site");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pilgrimage_route_stops_route_place_uidx" ON "pilgrimage_route_stops" USING btree ("route_slug","place_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pilgrimage_route_stops_route_position_uidx" ON "pilgrimage_route_stops" USING btree ("route_slug","position");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pilgrimage_route_stops_place_idx" ON "pilgrimage_route_stops" USING btree ("place_id");

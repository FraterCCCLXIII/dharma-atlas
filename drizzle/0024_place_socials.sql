CREATE TABLE IF NOT EXISTS "place_socials" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"platform" text NOT NULL,
	"url" text NOT NULL,
	"label" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "place_socials" ADD CONSTRAINT "place_socials_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_socials_place_idx" ON "place_socials" USING btree ("place_id");

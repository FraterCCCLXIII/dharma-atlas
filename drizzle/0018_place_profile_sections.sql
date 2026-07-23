CREATE TABLE IF NOT EXISTS "place_teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"display_name" text NOT NULL,
	"title" text,
	"image_path" text,
	"teacher_slug" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "place_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"place_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone,
	"timezone" text DEFAULT 'America/Los_Angeles' NOT NULL,
	"url" text,
	"recurrence" text,
	"is_cancelled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "place_teachers" ADD CONSTRAINT "place_teachers_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "place_teachers" ADD CONSTRAINT "place_teachers_teacher_slug_teachers_slug_fk" FOREIGN KEY ("teacher_slug") REFERENCES "public"."teachers"("slug") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "place_events" ADD CONSTRAINT "place_events_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_teachers_place_idx" ON "place_teachers" USING btree ("place_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_teachers_teacher_idx" ON "place_teachers" USING btree ("teacher_slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_events_place_idx" ON "place_events" USING btree ("place_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_events_starts_at_idx" ON "place_events" USING btree ("starts_at");

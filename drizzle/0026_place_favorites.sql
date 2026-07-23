CREATE TABLE IF NOT EXISTS "place_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"place_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "place_favorites" ADD CONSTRAINT "place_favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "place_favorites" ADD CONSTRAINT "place_favorites_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "place_favorites_user_place_idx" ON "place_favorites" USING btree ("user_id","place_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_favorites_user_idx" ON "place_favorites" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "place_favorites_place_idx" ON "place_favorites" USING btree ("place_id");

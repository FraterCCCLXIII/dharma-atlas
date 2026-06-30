CREATE TABLE "place_memberships" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"place_id" text NOT NULL,
	"role" text DEFAULT 'manager' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"place_id" text,
	"place_name" text NOT NULL,
	"listing_url" text,
	"affiliation_role" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "place_memberships" ADD CONSTRAINT "place_memberships_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "place_memberships" ADD CONSTRAINT "place_memberships_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_place_id_places_id_fk" FOREIGN KEY ("place_id") REFERENCES "public"."places"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "place_memberships_user_place_idx" ON "place_memberships" USING btree ("user_id","place_id");
--> statement-breakpoint
CREATE INDEX "place_memberships_place_idx" ON "place_memberships" USING btree ("place_id");
--> statement-breakpoint
CREATE INDEX "claims_status_idx" ON "claims" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "claims_user_idx" ON "claims" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX "claims_place_idx" ON "claims" USING btree ("place_id");

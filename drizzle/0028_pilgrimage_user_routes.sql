CREATE TABLE IF NOT EXISTS "pilgrimage_favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"kind" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_pilgrimage_routes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"base_route_slug" text,
	"stop_slugs" jsonb NOT NULL,
	"share_id" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pilgrimage_favorites" ADD CONSTRAINT "pilgrimage_favorites_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_pilgrimage_routes" ADD CONSTRAINT "user_pilgrimage_routes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "pilgrimage_favorites_user_kind_slug_idx" ON "pilgrimage_favorites" USING btree ("user_id","kind","slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pilgrimage_favorites_user_idx" ON "pilgrimage_favorites" USING btree ("user_id");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_pilgrimage_routes_share_id_idx" ON "user_pilgrimage_routes" USING btree ("share_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_pilgrimage_routes_user_idx" ON "user_pilgrimage_routes" USING btree ("user_id");

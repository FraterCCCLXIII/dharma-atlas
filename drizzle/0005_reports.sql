CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"entity_name" text NOT NULL,
	"entity_path" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"submitter_email" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

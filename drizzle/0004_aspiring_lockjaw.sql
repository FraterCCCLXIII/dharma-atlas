CREATE TABLE "ontology_nodes" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"parent_slug" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"node_type" text NOT NULL,
	"filter_id" text NOT NULL,
	"place_traditions" text[] DEFAULT '{}' NOT NULL,
	"infer_pattern" text,
	"applies_to_locations" boolean DEFAULT true NOT NULL,
	"applies_to_people" boolean DEFAULT true NOT NULL
);

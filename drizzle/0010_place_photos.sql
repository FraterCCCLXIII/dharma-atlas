CREATE TABLE IF NOT EXISTS "place_photos" (
  "id" serial PRIMARY KEY NOT NULL,
  "place_id" text NOT NULL REFERENCES "places"("id") ON DELETE CASCADE,
  "path" text NOT NULL,
  "photo_source" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "place_photos_place_idx" ON "place_photos" ("place_id");

INSERT INTO "place_photos" ("place_id", "path", "photo_source", "sort_order")
SELECT
  p.id,
  p.photo,
  p.photo_source,
  0
FROM "places" p
WHERE p.photo IS NOT NULL
  AND p.photo <> ''
  AND p.photo_source IS DISTINCT FROM 'generated'
  AND p.photo NOT LIKE '/places/generated/%'
  AND NOT EXISTS (
    SELECT 1 FROM "place_photos" pp WHERE pp.place_id = p.id AND pp.path = p.photo
  );

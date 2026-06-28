ALTER TABLE "teacher_books" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "teacher_books" AS tb
SET "sort_order" = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY teacher_slug ORDER BY id) - 1 AS rn
  FROM "teacher_books"
) AS sub
WHERE tb.id = sub.id;
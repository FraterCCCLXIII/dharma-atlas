ALTER TABLE "claims" ADD COLUMN IF NOT EXISTS "teacher_slug" text;
ALTER TABLE "claims" ADD COLUMN IF NOT EXISTS "entity_type" text NOT NULL DEFAULT 'place';

ALTER TABLE "place_events" ADD COLUMN IF NOT EXISTS "kind" text DEFAULT 'event' NOT NULL;
--> statement-breakpoint
ALTER TABLE "place_events" ADD COLUMN IF NOT EXISTS "start_time" text;
--> statement-breakpoint
ALTER TABLE "place_events" ADD COLUMN IF NOT EXISTS "end_time" text;
--> statement-breakpoint
ALTER TABLE "place_events" ADD COLUMN IF NOT EXISTS "rule" jsonb;
--> statement-breakpoint
ALTER TABLE "place_events" ALTER COLUMN "starts_at" DROP NOT NULL;
--> statement-breakpoint
-- Migrate legacy weekly/monthly rows into schedule kind + structured rule.
UPDATE "place_events"
SET
  "kind" = 'schedule',
  "start_time" = to_char(("starts_at" AT TIME ZONE COALESCE(NULLIF("timezone", ''), 'UTC')), 'HH24:MI'),
  "end_time" = CASE
    WHEN "ends_at" IS NOT NULL
      THEN to_char(("ends_at" AT TIME ZONE COALESCE(NULLIF("timezone", ''), 'UTC')), 'HH24:MI')
    ELSE NULL
  END,
  "rule" = CASE
    WHEN "recurrence" = 'weekly' THEN jsonb_build_object(
      'freq', 'weekly',
      'daysOfWeek', jsonb_build_array(
        EXTRACT(DOW FROM ("starts_at" AT TIME ZONE COALESCE(NULLIF("timezone", ''), 'UTC')))::int
      )
    )
    WHEN "recurrence" = 'monthly' THEN jsonb_build_object(
      'freq', 'monthlyNth',
      'week', LEAST(
        4,
        GREATEST(
          1,
          CEIL(
            EXTRACT(DAY FROM ("starts_at" AT TIME ZONE COALESCE(NULLIF("timezone", ''), 'UTC'))) / 7.0
          )::int
        )
      ),
      'weekday', EXTRACT(DOW FROM ("starts_at" AT TIME ZONE COALESCE(NULLIF("timezone", ''), 'UTC')))::int
    )
    ELSE "rule"
  END
WHERE "recurrence" IN ('weekly', 'monthly');

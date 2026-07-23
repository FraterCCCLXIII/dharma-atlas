/**
 * Populate the Sangha Test place with richer dummy profile + events.
 * Usage: bash -c 'set -a; source .env.local; set +a; npx tsx scripts/populate-sangha-test.ts'
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, ilike, or, sql } from "drizzle-orm";
import postgres from "postgres";
import { placeEvents, placeSocials, placeTeachers, places } from "../src/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

const TZ = "America/Los_Angeles";

function atLocal(isoLocal: string): Date {
  return new Date(isoLocal);
}

async function main() {
  const candidates = await db
    .select({
      id: places.id,
      name: places.name,
    })
    .from(places)
    .where(
      or(
        ilike(places.name, "%Sangha Test%"),
        ilike(places.name, "%Sangha New%"),
        eq(places.id, "81cfff109874"),
      ),
    )
    .limit(5);

  const place = candidates[0];
  if (!place) {
    const fuzzy = await db
      .select({ id: places.id, name: places.name })
      .from(places)
      .where(ilike(places.name, "%test%"))
      .limit(10);
    console.log(
      "No Sangha Test found. Nearby test places:",
      fuzzy.map((p) => `${p.id} ${p.name}`),
    );
    process.exit(1);
  }

  console.log(`Updating ${place.id} — ${place.name}`);

  await db
    .update(places)
    .set({
      name: "Sangha Test",
      type: "Meditation Center",
      faith: "Buddhist",
      tradition: "Zen",
      address: "2148 Addison Street, Berkeley, CA 94704",
      phone: "(510) 555-0142",
      website: "https://example.com/sangha-test",
      description:
        "A friendly neighborhood sangha for shared practice. Morning sits, beginner-friendly evenings, and occasional guest teachers. All are welcome — no prior experience needed. Bring yourself; cushions and chairs are provided.",
      offerings: [
        "sitting-meditation",
        "walking-meditation",
        "chanting",
        "dharma-talks",
        "beginner-friendly",
        "community-meals",
        "retreats",
        "lgbtq-welcoming",
        "wheelchair-accessible",
      ],
      updatedAt: new Date(),
    })
    .where(eq(places.id, place.id));

  await db.delete(placeTeachers).where(eq(placeTeachers.placeId, place.id));
  await db.insert(placeTeachers).values([
    {
      placeId: place.id,
      displayName: "Rev. Mira Solano",
      title: "Guiding teacher",
      bio: "Mira has practiced Zen for twenty years and loves introducing newcomers to the cushion. Her teaching emphasizes kindness, curiosity, and showing up as you are.",
      sortOrder: 0,
    },
    {
      placeId: place.id,
      displayName: "Jordan Park",
      title: "Practice leader",
      bio: "Jordan leads weekday morning sits and helps coordinate the monthly community day. Previously practiced at several Bay Area centers.",
      sortOrder: 1,
    },
    {
      placeId: place.id,
      displayName: "Aiko Chen",
      title: "Guest teacher",
      bio: "Aiko visits seasonally for weekend intensives focused on chanting and walking meditation.",
      sortOrder: 2,
    },
  ]);

  await db.delete(placeSocials).where(eq(placeSocials.placeId, place.id));
  await db.insert(placeSocials).values([
    {
      placeId: place.id,
      platform: "instagram",
      url: "https://instagram.com/sanghatest",
      sortOrder: 0,
    },
    {
      placeId: place.id,
      platform: "youtube",
      url: "https://youtube.com/@sanghatest",
      sortOrder: 1,
    },
    {
      placeId: place.id,
      platform: "facebook",
      url: "https://facebook.com/sanghatest",
      sortOrder: 2,
    },
    {
      placeId: place.id,
      platform: "x",
      url: "https://x.com/sanghatest",
      sortOrder: 3,
    },
    {
      placeId: place.id,
      platform: "other",
      url: "https://example.com/sangha-test/newsletter",
      label: "Newsletter",
      sortOrder: 4,
    },
  ]);

  await db.delete(placeEvents).where(eq(placeEvents.placeId, place.id));

  const year = new Date().getFullYear();

  const schedules = [
    {
      title: "Sunday morning sit",
      description:
        "Open sit with brief orientation for newcomers at 9:00. Walking meditation at 9:45.",
      startTime: "09:00",
      endTime: "10:30",
      rule: { freq: "weekly" as const, daysOfWeek: [0] },
      url: "https://example.com/sangha-test/sunday",
    },
    {
      title: "Tuesday evening practice",
      description: "Sit, walking, and a short dharma reflection. Tea afterward.",
      startTime: "18:30",
      endTime: "20:00",
      rule: { freq: "weekly" as const, daysOfWeek: [2] },
    },
    {
      title: "Thursday lunchtime sit",
      description: "A quiet mid-day pause. Come for all or part.",
      startTime: "12:15",
      endTime: "12:55",
      rule: { freq: "weekly" as const, daysOfWeek: [4] },
    },
    {
      title: "First Friday beginners evening",
      description: "Intro to posture, breath, and sangha etiquette. No registration required.",
      startTime: "19:00",
      endTime: "20:30",
      rule: { freq: "monthlyNth" as const, week: 1 as const, weekday: 5 },
      url: "https://example.com/sangha-test/beginners",
    },
    {
      title: "Last Saturday community work period",
      description: "Help care for the zendo, then share a simple lunch.",
      startTime: "10:00",
      endTime: "13:00",
      rule: { freq: "monthlyNth" as const, week: -1 as const, weekday: 6 },
    },
  ];

  const oneTime = [
    {
      title: "Guest talk: Practicing with uncertainty",
      description: "An evening talk with Q&A. Open to the public; dana welcome.",
      startsAt: atLocal(`${year}-08-07T19:00:00-07:00`),
      endsAt: atLocal(`${year}-08-07T21:00:00-07:00`),
      url: "https://example.com/sangha-test/guest-talk",
    },
    {
      title: "Half-day silent retreat",
      description:
        "Morning through early afternoon: sits, walking, and a shared vegetarian lunch.",
      startsAt: atLocal(`${year}-08-16T08:30:00-07:00`),
      endsAt: atLocal(`${year}-08-16T14:00:00-07:00`),
      url: "https://example.com/sangha-test/half-day",
    },
    {
      title: "Young adults circle",
      description: "Informal discussion and practice for ages 18–35.",
      startsAt: atLocal(`${year}-08-22T17:00:00-07:00`),
      endsAt: atLocal(`${year}-08-22T18:30:00-07:00`),
    },
    {
      title: "Chanting workshop with Aiko Chen",
      description: "Learn basic temple chants and the heart of group practice.",
      startsAt: atLocal(`${year}-09-05T10:00:00-07:00`),
      endsAt: atLocal(`${year}-09-05T12:30:00-07:00`),
    },
    {
      title: "Autumn equinox ceremony",
      description: "Candlelit sitting and dedication of merit for the season.",
      startsAt: atLocal(`${year}-09-22T18:00:00-07:00`),
      endsAt: atLocal(`${year}-09-22T19:30:00-07:00`),
    },
    {
      title: "All-day sesshin (registration)",
      description:
        "A full day of intensive practice. Pre-registration required; limited seats.",
      startsAt: atLocal(`${year}-10-11T06:30:00-07:00`),
      endsAt: atLocal(`${year}-10-11T17:00:00-07:00`),
      url: "https://example.com/sangha-test/sesshin",
    },
    {
      title: "Past: Spring open house",
      description: "Tour the center, meet teachers, and try a short guided sit.",
      startsAt: atLocal(`${year}-03-15T14:00:00-07:00`),
      endsAt: atLocal(`${year}-03-15T16:00:00-07:00`),
    },
  ];

  await db.insert(placeEvents).values([
    ...schedules.map((event) => ({
      placeId: place.id,
      kind: "schedule" as const,
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      rule: event.rule,
      timezone: TZ,
      url: event.url ?? null,
      sourceType: "manual",
      isCancelled: false,
    })),
    ...oneTime.map((event) => ({
      placeId: place.id,
      kind: "event" as const,
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      timezone: TZ,
      url: event.url ?? null,
      sourceType: "manual",
      isCancelled: false,
    })),
  ]);

  const [counts] = await db
    .select({
      schedules: sql<number>`count(*) filter (where ${placeEvents.kind} = 'schedule')::int`,
      events: sql<number>`count(*) filter (where ${placeEvents.kind} = 'event')::int`,
    })
    .from(placeEvents)
    .where(eq(placeEvents.placeId, place.id));

  console.log(
    `Done. Recurring: ${counts.schedules}, one-time: ${counts.events}. View /place/${place.id}`,
  );
}

main()
  .then(() => client.end())
  .catch(async (error) => {
    console.error(error);
    await client.end();
    process.exit(1);
  });

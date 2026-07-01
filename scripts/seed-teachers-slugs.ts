/**
 * Seed specific teachers by slug into Postgres (bypasses server-only db client).
 * Usage: npx tsx scripts/seed-teachers-slugs.ts ken-wilber jeff-salzman ...
 */
import { readFileSync } from "fs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import {
  teachers,
  teacherBooks,
  teacherSocials,
} from "../src/db/schema";
import type { Teacher } from "../src/types/teacher";

async function main() {
  const args = process.argv.slice(2);
  const all = args.includes("--all");
  const slugs = all ? [] : args.filter((a) => a !== "--all");
  if (!all && !slugs.length) {
    console.error("Usage: npx tsx scripts/seed-teachers-slugs.ts <slug>... | --all");
    process.exit(1);
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const dataset = JSON.parse(
    readFileSync("src/data/teachers.json", "utf8"),
  ) as { teachers: Teacher[] };
  const batch = all
    ? dataset.teachers
    : dataset.teachers.filter((t) => slugs.includes(t.slug));
  if (!batch.length) {
    console.error("No matching teachers in teachers.json");
    process.exit(1);
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  for (const [index, teacher] of batch.entries()) {
    await db
      .insert(teachers)
      .values({
        slug: teacher.slug,
        name: teacher.name,
        tradition: teacher.tradition,
        lineage: teacher.lineage,
        location: teacher.location,
        base: teacher.base ?? null,
        yearsTeaching: teacher.yearsTeaching,
        birthYear: teacher.birthYear ?? null,
        deathYear: teacher.deathYear ?? null,
        languages: teacher.languages,
        shortBio: teacher.shortBio,
        biography: teacher.biography,
        topics: teacher.topics,
        photo: teacher.photo,
        heroPhoto: teacher.heroPhoto ?? null,
        website: teacher.website ?? null,
      })
      .onConflictDoUpdate({
        target: teachers.slug,
        set: {
          name: teacher.name,
          tradition: teacher.tradition,
          lineage: teacher.lineage,
          location: teacher.location,
          base: teacher.base ?? null,
          yearsTeaching: teacher.yearsTeaching,
          birthYear: teacher.birthYear ?? null,
          deathYear: teacher.deathYear ?? null,
          languages: teacher.languages,
          shortBio: teacher.shortBio,
          biography: teacher.biography,
          topics: teacher.topics,
          photo: teacher.photo,
          heroPhoto: teacher.heroPhoto ?? null,
          website: teacher.website ?? null,
          updatedAt: new Date(),
        },
      });

    const slug = teacher.slug;
    await db.delete(teacherSocials).where(eq(teacherSocials.teacherSlug, slug));
    if (teacher.socials?.length) {
      await db
        .insert(teacherSocials)
        .values(teacher.socials.map((s) => ({ ...s, teacherSlug: slug })));
    }

    await db.delete(teacherBooks).where(eq(teacherBooks.teacherSlug, slug));
    if (teacher.bibliography?.length) {
      await db
        .insert(teacherBooks)
        .values(
          teacher.bibliography.map((b, index) => ({
            teacherSlug: slug,
            title: b.title,
            year: b.year,
            publisher: b.publisher,
            url: b.url ?? null,
            sortOrder: index,
          })),
        );
    }

    if (index % 50 === 0 || index === batch.length - 1) {
      console.log(`Seeded ${index + 1}/${batch.length} — ${teacher.name}`);
    }
  }

  await client.end();
  console.log(`Done — ${batch.length} teacher(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

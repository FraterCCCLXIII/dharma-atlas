#!/usr/bin/env tsx
/**
 * Seed Postgres from src/data/places.json and src/data/teachers.json.
 * Idempotent: upserts by place id and teacher slug.
 *
 * Usage: npm run db:seed
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  places,
  teacherBooks,
  teacherRelations,
  teacherRetreats,
  teacherSocials,
  teachers,
} from "../src/db/schema";
import type { Place, PlacesDataset } from "../src/types/place";
import type { Teacher, TeachersDataset } from "../src/types/teacher";

const ROOT = join(import.meta.dirname, "..");
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env.local");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { max: 1 });
const db = drizzle(client);

function loadPlaces(): Place[] {
  const raw = JSON.parse(
    readFileSync(join(ROOT, "src/data/places.json"), "utf8"),
  ) as PlacesDataset;
  return raw.places;
}

function loadTeachers(): Teacher[] {
  const raw = JSON.parse(
    readFileSync(join(ROOT, "src/data/teachers.json"), "utf8"),
  ) as TeachersDataset;
  return raw.teachers;
}

function normalizeRelations(teacher: Teacher) {
  const rels = teacher.relations;
  if (!rels) return [];

  const rows: {
    fromSlug: string;
    toSlug: string | null;
    name: string;
    role: string;
    note: string | null;
    type: string;
  }[] = [];

  for (const type of ["teacher", "peer", "student"] as const) {
    const group = rels[type === "teacher" ? "teachers" : `${type}s` as "peers" | "students"];
    if (!group) continue;
    for (const rel of group) {
      rows.push({
        fromSlug: teacher.slug,
        toSlug: rel.slug ?? null,
        name: rel.name,
        role: rel.role,
        note: rel.note ?? null,
        type,
      });
    }
  }

  return rows;
}

async function seedPlaces(list: Place[]) {
  let count = 0;
  for (const place of list) {
    await db
      .insert(places)
      .values({
        id: place.id,
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        tradition: place.tradition,
        faith: place.faith,
        type: place.type,
        folder: place.folder,
        address: place.address,
        phone: place.phone,
        website: place.website,
        schools: place.schools ?? [],
      })
      .onConflictDoUpdate({
        target: places.id,
        set: {
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          tradition: place.tradition,
          faith: place.faith,
          type: place.type,
          folder: place.folder,
          address: place.address,
          phone: place.phone,
          website: place.website,
          schools: place.schools ?? [],
          updatedAt: new Date(),
        },
      });
    count++;
    if (count % 500 === 0) console.log(`  places: ${count}/${list.length}`);
  }
  return count;
}

async function seedTeacher(teacher: Teacher) {
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
  if (teacher.socials.length) {
    await db
      .insert(teacherSocials)
      .values(teacher.socials.map((s) => ({ ...s, teacherSlug: slug })));
  }

  await db.delete(teacherBooks).where(eq(teacherBooks.teacherSlug, slug));
  if (teacher.bibliography.length) {
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

  await db.delete(teacherRetreats).where(eq(teacherRetreats.teacherSlug, slug));
  if (teacher.retreats.length) {
    await db
      .insert(teacherRetreats)
      .values(teacher.retreats.map((r) => ({ ...r, teacherSlug: slug })));
  }

  await db.delete(teacherRelations).where(eq(teacherRelations.fromSlug, slug));
  const relationRows = normalizeRelations(teacher);
  if (relationRows.length) {
    await db.insert(teacherRelations).values(relationRows);
  }
}

async function main() {
  console.log("Loading JSON…");
  const placeList = loadPlaces();
  const teacherList = loadTeachers();

  console.log(`Seeding ${placeList.length} places…`);
  const placeCount = await seedPlaces(placeList);

  console.log(`Seeding ${teacherList.length} teachers…`);
  for (let i = 0; i < teacherList.length; i++) {
    await seedTeacher(teacherList[i]!);
    if ((i + 1) % 50 === 0) console.log(`  teachers: ${i + 1}/${teacherList.length}`);
  }

  const { buildDefaultOntologyNodes } = await import("../src/lib/ontology/defaults");
  const { buildOntologySnapshot } = await import("../src/lib/ontology/build-snapshot");
  const { ontologyNodes } = await import("../src/db/schema");

  const [existing] = await db.select({ slug: ontologyNodes.slug }).from(ontologyNodes).limit(1);
  if (!existing) {
    const nodes = buildDefaultOntologyNodes();
    buildOntologySnapshot(nodes);
    await db.insert(ontologyNodes).values(
      nodes.map((node) => ({
        slug: node.slug,
        label: node.label,
        parentSlug: node.parentSlug,
        sortOrder: node.sortOrder,
        nodeType: node.nodeType,
        filterId: node.filterId,
        placeTraditions: node.placeTraditions,
        inferPattern: node.inferPattern,
        appliesToLocations: node.appliesToLocations,
        appliesToPeople: node.appliesToPeople,
      })),
    );
    console.log(`Seeded ${nodes.length} ontology nodes.`);
  }

  console.log(`Done — ${placeCount} places, ${teacherList.length} teachers.`);
}

main()
  .then(() => client.end())
  .catch((err) => {
    console.error(err);
    void client.end();
    process.exit(1);
  });

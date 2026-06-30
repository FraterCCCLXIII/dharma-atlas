import { readFileSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  ontologyNodes,
  places,
  teacherBooks,
  teacherRelations,
  teacherRetreats,
  teacherSocials,
  teachers,
} from "@/db/schema";
import { mergePlaceFields } from "@/lib/place-quality";
import { rowToPlace } from "@/lib/place-row";
import type { Place, PlacesDataset } from "@/types/place";
import type { Teacher, TeachersDataset } from "@/types/teacher";

export type SeedOptions = {
  places?: Place[];
  teachers?: Teacher[];
  fromFiles?: boolean;
  includeOntology?: boolean;
  forceFields?: string[];
};

export type SeedResult = {
  places: number;
  teachers: number;
  ontologyNodes: number;
};

function openingHoursColumn(
  hours: Place["openingHours"] | undefined | null,
): string | null {
  if (!hours) return null;
  return JSON.stringify(hours);
}

function placeDbFields(merged: ReturnType<typeof mergePlaceFields>, incoming: Place) {
  return {
    name: merged.name ?? incoming.name,
    lat: merged.lat ?? incoming.lat,
    lng: merged.lng ?? incoming.lng,
    tradition: merged.tradition ?? incoming.tradition,
    faith: merged.faith ?? incoming.faith,
    type: merged.type ?? incoming.type,
    folder: merged.folder ?? incoming.folder,
    address: merged.address ?? incoming.address,
    phone: merged.phone ?? incoming.phone ?? null,
    website: merged.website ?? incoming.website ?? null,
    description: merged.description ?? incoming.description ?? null,
    descriptionSource: merged.descriptionSource ?? incoming.descriptionSource ?? null,
    coordPrecision: merged.coordPrecision ?? incoming.coordPrecision ?? "unknown",
    dataSource: merged.dataSource ?? incoming.dataSource ?? incoming.folder ?? null,
    verifiedFields: merged.verifiedFields ?? incoming.verifiedFields ?? [],
    qualityFlags: merged.qualityFlags ?? incoming.qualityFlags ?? [],
    photo: merged.photo ?? incoming.photo ?? null,
    photoSource: merged.photoSource ?? incoming.photoSource ?? null,
    googlePlaceId: merged.googlePlaceId ?? incoming.googlePlaceId ?? null,
    googleMapsUri: merged.googleMapsUri ?? incoming.googleMapsUri ?? null,
    openingHours: openingHoursColumn(merged.openingHours ?? incoming.openingHours),
    googleRating: merged.googleRating ?? incoming.googleRating ?? null,
    googleRatingCount: merged.googleRatingCount ?? incoming.googleRatingCount ?? null,
    businessStatus: merged.businessStatus ?? incoming.businessStatus ?? null,
    googlePrimaryType: merged.googlePrimaryType ?? incoming.googlePrimaryType ?? null,
    schools: merged.schools ?? incoming.schools ?? [],
  };
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

function loadPlacesFromFiles(root: string): Place[] {
  const raw = JSON.parse(
    readFileSync(join(root, "src/data/places.json"), "utf8"),
  ) as PlacesDataset;
  return raw.places;
}

function loadTeachersFromFiles(root: string): Teacher[] {
  const raw = JSON.parse(
    readFileSync(join(root, "src/data/teachers.json"), "utf8"),
  ) as TeachersDataset;
  return raw.teachers;
}

export async function seedPlacesFromList(list: Place[], forceFields: string[] = []) {
  let count = 0;
  for (const incoming of list) {
    const [existingRow] = await db
      .select()
      .from(places)
      .where(eq(places.id, incoming.id))
      .limit(1);

    const existing = existingRow ? rowToPlace(existingRow) : {};
    const merged = mergePlaceFields(existing, incoming, { forceFields });

    await db
      .insert(places)
      .values({
        id: incoming.id,
        ...placeDbFields(merged, incoming),
      })
      .onConflictDoUpdate({
        target: places.id,
        set: {
          ...placeDbFields(merged, incoming),
          updatedAt: new Date(),
        },
      });
    count++;
  }
  return count;
}

export async function seedTeacherRecord(teacher: Teacher) {
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

export async function seedTeachersFromList(list: Teacher[]) {
  for (const teacher of list) {
    await seedTeacherRecord(teacher);
  }
  return list.length;
}

async function seedDefaultOntologyIfEmpty() {
  const [existing] = await db.select({ slug: ontologyNodes.slug }).from(ontologyNodes).limit(1);
  if (existing) return 0;

  const { buildDefaultOntologyNodes } = await import("@/lib/ontology/defaults");
  const { buildOntologySnapshot } = await import("@/lib/ontology/build-snapshot");
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
  return nodes.length;
}

export async function runDataSeed(options: SeedOptions): Promise<SeedResult> {
  const root = process.cwd();
  const placeList =
    options.places ??
    (options.fromFiles ? loadPlacesFromFiles(root) : undefined) ??
    [];
  const teacherList =
    options.teachers ??
    (options.fromFiles ? loadTeachersFromFiles(root) : undefined) ??
    [];

  const placesCount = placeList.length ? await seedPlacesFromList(placeList, options.forceFields ?? []) : 0;
  const teachersCount = teacherList.length ? await seedTeachersFromList(teacherList) : 0;
  const ontologyCount =
    options.includeOntology === false ? 0 : await seedDefaultOntologyIfEmpty();

  return {
    places: placesCount,
    teachers: teachersCount,
    ontologyNodes: ontologyCount,
  };
}

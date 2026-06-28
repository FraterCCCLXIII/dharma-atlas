import "server-only";

import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  teacherBooks,
  teacherRelations,
  teacherRetreats,
  teacherSocials,
  teachers,
} from "@/db/schema";
import type { Teacher, Book, Retreat, Relation } from "@/types/teacher";

type TeacherRow = typeof teachers.$inferSelect;
type BookRow = typeof teacherBooks.$inferSelect;

const publishedOnly = eq(teachers.isDraft, false);

function sortBooks(books: BookRow[]) {
  return [...books].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
}

function assembleFromRows(
  row: TeacherRow,
  bookRows: (typeof teacherBooks.$inferSelect)[],
  retreatRows: (typeof teacherRetreats.$inferSelect)[],
  socialRows: (typeof teacherSocials.$inferSelect)[],
  relationRows: (typeof teacherRelations.$inferSelect)[],
): Teacher {
  const groupRelations = (type: string): Relation[] =>
    relationRows
      .filter((r) => r.type === type)
      .map((r) => ({
        slug: r.toSlug ?? undefined,
        name: r.name,
        role: r.role,
        note: r.note ?? undefined,
      }));

  return {
    slug: row.slug,
    name: row.name,
    tradition: row.tradition,
    lineage: row.lineage,
    location: row.location,
    base: row.base ?? undefined,
    yearsTeaching: row.yearsTeaching,
    birthYear: row.birthYear,
    deathYear: row.deathYear,
    languages: row.languages,
    shortBio: row.shortBio,
    biography: row.biography,
    topics: row.topics,
    photo: row.photo,
    heroPhoto: row.heroPhoto ?? undefined,
    website: row.website ?? undefined,
    isDraft: row.isDraft,
    socials: socialRows.map((s) => ({ label: s.label, url: s.url })),
    bibliography: bookRows.map<Book>((b) => ({
      title: b.title,
      year: b.year,
      publisher: b.publisher,
      url: b.url ?? undefined,
    })),
    retreats: retreatRows.map<Retreat>((r) => ({
      title: r.title,
      dates: r.dates,
      location: r.location,
      price: r.price ?? undefined,
    })),
    relations: {
      teachers: groupRelations("teacher"),
      peers: groupRelations("peer"),
      students: groupRelations("student"),
    },
  };
}

async function assembleTeacher(row: TeacherRow): Promise<Teacher> {
  const [bookRows, retreatRows, socialRows, relationRows] = await Promise.all([
    db
      .select()
      .from(teacherBooks)
      .where(eq(teacherBooks.teacherSlug, row.slug))
      .orderBy(asc(teacherBooks.sortOrder), asc(teacherBooks.id)),
    db.select().from(teacherRetreats).where(eq(teacherRetreats.teacherSlug, row.slug)),
    db.select().from(teacherSocials).where(eq(teacherSocials.teacherSlug, row.slug)),
    db.select().from(teacherRelations).where(eq(teacherRelations.fromSlug, row.slug)),
  ]);

  return assembleFromRows(row, bookRows, retreatRows, socialRows, relationRows);
}

async function loadAllTeachersRows(includeDrafts: boolean) {
  const query = db.select().from(teachers).orderBy(teachers.name);
  if (!includeDrafts) {
    return query.where(publishedOnly);
  }
  return query;
}

export async function getTeachersCount() {
  const [row] = await db.select({ count: count() }).from(teachers);
  return row?.count ?? 0;
}

export async function getPublishedTeachersCount() {
  const [row] = await db.select({ count: count() }).from(teachers).where(publishedOnly);
  return row?.count ?? 0;
}

async function assembleTeachersFromRows(rows: TeacherRow[]): Promise<Teacher[]> {
  if (rows.length === 0) return [];

  const [allBooks, allRetreats, allSocials, allRelations] = await Promise.all([
    db
      .select()
      .from(teacherBooks)
      .orderBy(asc(teacherBooks.teacherSlug), asc(teacherBooks.sortOrder), asc(teacherBooks.id)),
    db.select().from(teacherRetreats),
    db.select().from(teacherSocials),
    db.select().from(teacherRelations),
  ]);

  const booksBySlug = new Map<string, typeof allBooks>();
  for (const book of allBooks) {
    const list = booksBySlug.get(book.teacherSlug) ?? [];
    list.push(book);
    booksBySlug.set(book.teacherSlug, list);
  }

  const retreatsBySlug = new Map<string, typeof allRetreats>();
  for (const retreat of allRetreats) {
    const list = retreatsBySlug.get(retreat.teacherSlug) ?? [];
    list.push(retreat);
    retreatsBySlug.set(retreat.teacherSlug, list);
  }

  const socialsBySlug = new Map<string, typeof allSocials>();
  for (const social of allSocials) {
    const list = socialsBySlug.get(social.teacherSlug) ?? [];
    list.push(social);
    socialsBySlug.set(social.teacherSlug, list);
  }

  const relationsBySlug = new Map<string, typeof allRelations>();
  for (const relation of allRelations) {
    const list = relationsBySlug.get(relation.fromSlug) ?? [];
    list.push(relation);
    relationsBySlug.set(relation.fromSlug, list);
  }

  return rows.map((row) =>
    assembleFromRows(
      row,
      sortBooks(booksBySlug.get(row.slug) ?? []),
      retreatsBySlug.get(row.slug) ?? [],
      socialsBySlug.get(row.slug) ?? [],
      relationsBySlug.get(row.slug) ?? [],
    ),
  );
}

export async function getAllTeachers(): Promise<Teacher[]> {
  const rows = await loadAllTeachersRows(false);
  return assembleTeachersFromRows(rows);
}

export async function getAllTeachersForAdmin(): Promise<Teacher[]> {
  const rows = await loadAllTeachersRows(true);
  return assembleTeachersFromRows(rows);
}

export async function getTeacherBySlug(
  slug: string,
  options?: { includeDrafts?: boolean },
): Promise<Teacher | null> {
  const [row] = await db.select().from(teachers).where(eq(teachers.slug, slug)).limit(1);
  if (!row) return null;
  if (row.isDraft && !options?.includeDrafts) return null;
  return assembleTeacher(row);
}

export async function getTeacherPhotoMap(): Promise<Map<string, string>> {
  const rows = await db
    .select({ slug: teachers.slug, photo: teachers.photo })
    .from(teachers)
    .where(publishedOnly);
  return new Map(rows.map((r) => [r.slug, r.photo]));
}

export async function getSimilarTeachers(teacher: Teacher, limit = 4): Promise<Teacher[]> {
  const all = await getAllTeachers();
  return all
    .filter((candidate) => candidate.slug !== teacher.slug)
    .sort((a, b) => {
      const aSameTradition = a.tradition === teacher.tradition ? 0 : 1;
      const bSameTradition = b.tradition === teacher.tradition ? 0 : 1;
      if (aSameTradition !== bSameTradition) return aSameTradition - bSameTradition;

      const aSameLineage = a.lineage === teacher.lineage ? 0 : 1;
      const bSameLineage = b.lineage === teacher.lineage ? 0 : 1;
      if (aSameLineage !== bSameLineage) return aSameLineage - bSameLineage;

      return a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export async function getTeacherStaticParams() {
  const rows = await db
    .select({ slug: teachers.slug })
    .from(teachers)
    .where(publishedOnly);
  return rows.map((r) => ({ slug: r.slug }));
}

export { assembleTeacher };

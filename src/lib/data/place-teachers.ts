import "server-only";

import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { placeTeachers, teachers } from "@/db/schema";
import type { PlaceTeacher } from "@/types/place";
import type { PlaceTeacherInput } from "@/lib/validations/place-profile";

function rowToPlaceTeacher(row: typeof placeTeachers.$inferSelect): PlaceTeacher {
  return {
    id: row.id,
    placeId: row.placeId,
    displayName: row.displayName,
    title: row.title ?? undefined,
    bio: row.bio ?? undefined,
    imagePath: row.imagePath ?? undefined,
    teacherSlug: row.teacherSlug ?? undefined,
    sortOrder: row.sortOrder,
  };
}

export async function getPlaceTeachers(placeId: string): Promise<PlaceTeacher[]> {
  const rows = await db
    .select()
    .from(placeTeachers)
    .where(eq(placeTeachers.placeId, placeId))
    .orderBy(asc(placeTeachers.sortOrder), asc(placeTeachers.id));

  return rows.map(rowToPlaceTeacher);
}

/** Enrich stubs with linked teacher photo when the stub has no image. */
export async function getPlaceTeachersForDisplay(placeId: string): Promise<PlaceTeacher[]> {
  const rows = await getPlaceTeachers(placeId);
  const slugs = rows
    .map((row) => row.teacherSlug)
    .filter((slug): slug is string => Boolean(slug));

  if (slugs.length === 0) return rows;

  const linked = await db
    .select({
      slug: teachers.slug,
      name: teachers.name,
      photo: teachers.photo,
      isDraft: teachers.isDraft,
    })
    .from(teachers)
    .where(and(inArray(teachers.slug, slugs), eq(teachers.isDraft, false)));

  const bySlug = new Map(linked.map((row) => [row.slug, row]));

  return rows.map((row) => {
    if (!row.teacherSlug) return row;
    const teacher = bySlug.get(row.teacherSlug);
    if (!teacher) {
      return { ...row, teacherSlug: undefined };
    }
    return {
      ...row,
      displayName: row.displayName || teacher.name,
      imagePath: row.imagePath || teacher.photo || undefined,
    };
  });
}

export async function replacePlaceTeachers(
  placeId: string,
  input: PlaceTeacherInput[],
): Promise<PlaceTeacher[]> {
  const existing = await db
    .select({ id: placeTeachers.id })
    .from(placeTeachers)
    .where(eq(placeTeachers.placeId, placeId));
  const existingIds = new Set(existing.map((row) => row.id));
  const keepIds = new Set(
    input.map((row) => row.id).filter((id): id is number => typeof id === "number"),
  );

  const toDelete = [...existingIds].filter((id) => !keepIds.has(id));
  if (toDelete.length > 0) {
    await db.delete(placeTeachers).where(inArray(placeTeachers.id, toDelete));
  }

  const now = new Date();
  for (const [index, teacher] of input.entries()) {
    const values = {
      placeId,
      displayName: teacher.displayName,
      title: teacher.title,
      bio: teacher.bio,
      imagePath: teacher.imagePath,
      teacherSlug: teacher.teacherSlug,
      sortOrder: teacher.sortOrder ?? index,
      updatedAt: now,
    };

    if (teacher.id && existingIds.has(teacher.id)) {
      await db.update(placeTeachers).set(values).where(eq(placeTeachers.id, teacher.id));
    } else {
      await db.insert(placeTeachers).values(values);
    }
  }

  return getPlaceTeachers(placeId);
}

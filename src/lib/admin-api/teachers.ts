import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  teacherBooks,
  teacherRelations,
  teacherRetreats,
  teacherSocials,
  teachers,
} from "@/db/schema";
import { getAllTeachersForAdmin, getTeacherBySlug } from "@/lib/data/teachers";
import { deleteAllLocalPhotosForSlug } from "@/lib/teacher-photo-files";
import { teacherInputSchema, type TeacherInput } from "@/lib/validations/teacher";

async function replaceTeacherRelations(slug: string, input: TeacherInput) {
  await db.delete(teacherSocials).where(eq(teacherSocials.teacherSlug, slug));
  if (input.socials.length) {
    await db
      .insert(teacherSocials)
      .values(input.socials.map((s) => ({ ...s, teacherSlug: slug })));
  }

  await db.delete(teacherBooks).where(eq(teacherBooks.teacherSlug, slug));
  if (input.bibliography.length) {
    await db
      .insert(teacherBooks)
      .values(
        input.bibliography.map((b, index) => ({
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
  if (input.retreats.length) {
    await db
      .insert(teacherRetreats)
      .values(input.retreats.map((r) => ({ ...r, teacherSlug: slug })));
  }

  await db.delete(teacherRelations).where(eq(teacherRelations.fromSlug, slug));
  if (input.relations.length) {
    await db.insert(teacherRelations).values(
      input.relations.map((r) => ({
        fromSlug: slug,
        toSlug: r.slug ?? null,
        name: r.name,
        role: r.role,
        note: r.note ?? null,
        type: r.type,
      })),
    );
  }
}

function teacherRow(input: TeacherInput) {
  return {
    slug: input.slug,
    name: input.name,
    tradition: input.tradition,
    lineage: input.lineage,
    location: input.location,
    base: input.base ?? null,
    yearsTeaching: input.yearsTeaching,
    birthYear: input.birthYear ?? null,
    deathYear: input.deathYear ?? null,
    languages: input.languages,
    shortBio: input.shortBio,
    biography: input.biography,
    topics: input.topics,
    photo: input.photo,
    heroPhoto: input.heroPhoto ?? null,
    website: input.website ?? null,
    isDraft: input.isDraft,
    updatedAt: new Date(),
  };
}

export async function listAdminTeachers() {
  return getAllTeachersForAdmin();
}

export async function getAdminTeacher(slug: string) {
  return getTeacherBySlug(slug, { includeDrafts: true });
}

export async function createAdminTeacher(input: unknown) {
  const data = teacherInputSchema.parse(input);
  await db.insert(teachers).values(teacherRow(data));
  await replaceTeacherRelations(data.slug, data);
  return getTeacherBySlug(data.slug, { includeDrafts: true });
}

export async function updateAdminTeacher(originalSlug: string, input: unknown) {
  const data = teacherInputSchema.parse(input);
  const [existing] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.slug, originalSlug))
    .limit(1);
  if (!existing) {
    throw new Error("Teacher not found");
  }

  await db.update(teachers).set(teacherRow(data)).where(eq(teachers.slug, originalSlug));
  await replaceTeacherRelations(data.slug, data);
  return getTeacherBySlug(data.slug, { includeDrafts: true });
}

export async function deleteAdminTeacher(slug: string) {
  const [existing] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.slug, slug))
    .limit(1);
  if (!existing) {
    throw new Error("Teacher not found");
  }

  deleteAllLocalPhotosForSlug(slug);
  await db.delete(teachers).where(eq(teachers.slug, slug));
  return { slug, deleted: true };
}

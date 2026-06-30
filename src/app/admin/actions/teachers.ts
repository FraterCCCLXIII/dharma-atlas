"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import {
  teacherBooks,
  teacherRelations,
  teacherRetreats,
  teacherSocials,
  teachers,
} from "@/db/schema";
import { requirePermission } from "@/lib/auth-server";
import { deleteAllLocalPhotosForSlug } from "@/lib/teacher-photo-files";
import { PEOPLE_LIST_PATH, personProfilePath } from "@/lib/explore-routes";
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

export async function createTeacherAction(input: TeacherInput) {
  await requirePermission("teacher", "create");
  const data = teacherInputSchema.parse(input);

  await db.insert(teachers).values(teacherRow(data));
  await replaceTeacherRelations(data.slug, data);

  revalidatePath("/");
  revalidatePath(PEOPLE_LIST_PATH);
  revalidatePath(personProfilePath(data.slug));
  revalidatePath("/admin/teachers");
  redirect(`/admin/teachers/${data.slug}/edit`);
}

export async function updateTeacherAction(originalSlug: string, input: TeacherInput) {
  await requirePermission("teacher", "update");
  const data = teacherInputSchema.parse(input);

  await db.update(teachers).set(teacherRow(data)).where(eq(teachers.slug, originalSlug));
  await replaceTeacherRelations(data.slug, data);

  revalidatePath("/");
  revalidatePath(PEOPLE_LIST_PATH);
  revalidatePath(personProfilePath(originalSlug));
  revalidatePath(personProfilePath(data.slug));
  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}

export async function deleteTeacherAction(slug: string) {
  await requirePermission("teacher", "delete");
  deleteAllLocalPhotosForSlug(slug);
  await db.delete(teachers).where(eq(teachers.slug, slug));

  revalidatePath("/");
  revalidatePath(PEOPLE_LIST_PATH);
  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}

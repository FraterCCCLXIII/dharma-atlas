"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { db } from "@/db/client";
import { places, submissions, teachers } from "@/db/schema";
import { requirePermission } from "@/lib/auth-server";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generatePlaceId() {
  return randomBytes(6).toString("hex");
}

export async function approveSubmissionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Invalid submission id");

  const session = await requirePermission("submission", "update");
  const [row] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
  if (!row || row.status !== "pending") throw new Error("Submission not found or already reviewed");

  if (row.entryType === "teacher") {
    const baseSlug = slugify(row.name);
    let slug = baseSlug || `teacher-${id}`;
    let suffix = 1;
    while (true) {
      const [existing] = await db.select().from(teachers).where(eq(teachers.slug, slug)).limit(1);
      if (!existing) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    await db.insert(teachers).values({
      slug,
      name: row.name,
      tradition: "Buddhist",
      lineage: row.notes?.slice(0, 200) ?? "Unknown",
      location: row.location ?? "Unknown",
      shortBio: row.notes?.slice(0, 300) ?? "",
      website: row.website,
      photo: "",
    });

    await db
      .update(submissions)
      .set({
        status: "approved",
        reviewedBy: session.user.email,
        reviewedAt: new Date(),
      })
      .where(eq(submissions.id, id));

    revalidatePath("/admin/submissions");
    redirect(`/admin/teachers/${slug}/edit`);
  }

  const placeId = generatePlaceId();
  await db.insert(places).values({
    id: placeId,
    name: row.name,
    lat: 0,
    lng: 0,
    tradition: "Buddhist",
    faith: "Buddhist",
    type: "Center",
    folder: "Submissions",
    address: row.location ?? "",
    website: row.website,
    schools: [],
  });

  await db
    .update(submissions)
    .set({
      status: "approved",
      reviewedBy: session.user.email,
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, id));

  revalidatePath("/admin/submissions");
  redirect(`/admin/places/${placeId}/edit`);
}

export async function rejectSubmissionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Invalid submission id");

  const session = await requirePermission("submission", "update");

  await db
    .update(submissions)
    .set({
      status: "rejected",
      reviewedBy: session.user.email,
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, id));

  revalidatePath("/admin/submissions");
  redirect("/admin/submissions");
}

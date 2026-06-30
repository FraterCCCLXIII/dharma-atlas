"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { db } from "@/db/client";
import { places, submissions, teachers } from "@/db/schema";
import { requirePermission } from "@/lib/auth-server";
import {
  geocodeAddress,
  hasValidCoords,
} from "@/lib/geocode";
import {
  parseSubmissionPayload,
  submissionLocationAddress,
} from "@/lib/validations/submission";
import {
  notifySubmissionReviewed,
} from "@/lib/email";

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

  const parsed = parseSubmissionPayload(row);

  if (row.entryType === "teacher") {
    const baseSlug = slugify(row.name);
    let slug = baseSlug || `teacher-${id}`;
    let suffix = 1;
    while (true) {
      const [existing] = await db.select().from(teachers).where(eq(teachers.slug, slug)).limit(1);
      if (!existing) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    const tradition =
      parsed.entryType === "teacher" && parsed.tradition?.trim()
        ? parsed.tradition.trim()
        : "Buddhist";
    const lineage =
      parsed.entryType === "teacher" && parsed.lineage?.trim()
        ? parsed.lineage.trim()
        : (row.notes?.slice(0, 200) ?? "Unknown");

    await db.insert(teachers).values({
      slug,
      name: row.name,
      tradition,
      lineage,
      location: row.location ?? "Unknown",
      shortBio: row.notes?.slice(0, 300) ?? "",
      website: row.website,
      photo: "",
      isDraft: true,
    });

    await db
      .update(submissions)
      .set({
        status: "approved",
        reviewedBy: session.user.email,
        reviewedAt: new Date(),
      })
      .where(eq(submissions.id, id));

    await notifySubmissionReviewed({
      to: row.submitterEmail,
      name: row.name,
      approved: true,
    });

    revalidatePath("/admin/submissions");
    redirect(`/admin/teachers/${slug}/edit`);
  }

  const placeId = generatePlaceId();
  const tradition =
    parsed.entryType === "location" && parsed.tradition?.trim()
      ? parsed.tradition.trim()
      : "Buddhist";
  const placeType =
    parsed.entryType === "location" && parsed.placeType ? parsed.placeType : "Center";
  const addressQuery = submissionLocationAddress({
    ...parsed,
    location: row.location ?? undefined,
  });
  const fullAddress =
    parsed.entryType === "location" && parsed.address?.trim()
      ? [parsed.address.trim(), row.location ?? ""].filter(Boolean).join(", ")
      : (row.location ?? "");
  const geocoded = await geocodeAddress(addressQuery || row.name);
  const lat = geocoded?.lat ?? 0;
  const lng = geocoded?.lng ?? 0;
  const qualityFlags = hasValidCoords(lat, lng) ? [] : ["missing_coords"];

  await db.insert(places).values({
    id: placeId,
    name: row.name,
    lat,
    lng,
    tradition,
    faith: "Buddhist",
    type: placeType,
    folder: "Submissions",
    address: fullAddress,
    website: row.website,
    schools: [],
    isDraft: true,
    qualityFlags,
    coordPrecision: hasValidCoords(lat, lng) ? "address" : "unknown",
  });

  await db
    .update(submissions)
    .set({
      status: "approved",
      reviewedBy: session.user.email,
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, id));

  await notifySubmissionReviewed({
    to: row.submitterEmail,
    name: row.name,
    approved: true,
  });

  revalidatePath("/admin/submissions");
  redirect(`/admin/places/${placeId}/edit`);
}

export async function rejectSubmissionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Invalid submission id");

  const session = await requirePermission("submission", "update");
  const [row] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
  if (!row) throw new Error("Submission not found");

  await db
    .update(submissions)
    .set({
      status: "rejected",
      reviewedBy: session.user.email,
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, id));

  await notifySubmissionReviewed({
    to: row.submitterEmail,
    name: row.name,
    approved: false,
  });

  revalidatePath("/admin/submissions");
  redirect("/admin/submissions");
}

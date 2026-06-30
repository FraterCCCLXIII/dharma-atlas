"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { claims } from "@/db/schema";
import { requirePermission } from "@/lib/auth-server";
import { createMembership, getMembership } from "@/lib/data/memberships";
import { getClaimById, updateClaimStatus } from "@/lib/data/claims";
import { notifyClaimReviewed } from "@/lib/email";

export async function linkClaimPlaceAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const placeId = String(formData.get("placeId") ?? "").trim();
  if (!Number.isFinite(id) || !placeId) throw new Error("Invalid link request");

  await requirePermission("submission", "update");
  await db.update(claims).set({ placeId }).where(eq(claims.id, id));
  revalidatePath("/admin/claims");
}

export async function approveClaimAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Invalid claim id");

  const session = await requirePermission("submission", "update");
  const claim = await getClaimById(id);
  if (!claim || claim.status !== "pending") {
    throw new Error("Claim not found or already reviewed");
  }

  if (claim.entityType === "teacher") {
    await updateClaimStatus(id, "approved", session.user.email);
    await notifyClaimReviewed({
      to: claim.userEmail,
      placeName: claim.placeName,
      approved: true,
    });
    revalidatePath("/admin/claims");
    redirect("/admin/claims");
    return;
  }

  if (!claim.placeId) {
    throw new Error("Claim has no linked place — link a listing before approving.");
  }

  const existing = await getMembership(claim.userId, claim.placeId);
  if (!existing) {
    await createMembership({
      userId: claim.userId,
      placeId: claim.placeId,
    });
  }

  await updateClaimStatus(id, "approved", session.user.email);
  await notifyClaimReviewed({
    to: claim.userEmail,
    placeName: claim.placeName,
    approved: true,
  });

  revalidatePath("/admin/claims");
  revalidatePath("/manage");
  redirect("/admin/claims");
}

export async function rejectClaimAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Invalid claim id");

  const session = await requirePermission("submission", "update");
  const claim = await getClaimById(id);
  if (!claim || claim.status !== "pending") {
    throw new Error("Claim not found or already reviewed");
  }

  await updateClaimStatus(id, "rejected", session.user.email);
  await notifyClaimReviewed({
    to: claim.userEmail,
    placeName: claim.placeName,
    approved: false,
  });

  revalidatePath("/admin/claims");
  redirect("/admin/claims");
}

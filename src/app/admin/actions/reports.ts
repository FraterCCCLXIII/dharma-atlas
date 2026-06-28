"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth-server";
import { updateReportStatus } from "@/lib/data/reports";

async function reviewReport(id: number, status: "reviewed" | "dismissed") {
  const session = await requirePermission("report", "update");
  await updateReportStatus(id, status, session.user.email);
  revalidatePath("/admin/reports");
  redirect("/admin/reports");
}

export async function resolveReportAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Invalid report id");
  await reviewReport(id, "reviewed");
}

export async function dismissReportAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) throw new Error("Invalid report id");
  await reviewReport(id, "dismissed");
}

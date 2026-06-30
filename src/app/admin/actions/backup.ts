"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth-server";
import { createBackup, listBackups } from "@/lib/backup";

export async function createBackupAction(archive = true) {
  await requireOwner();
  const result = await createBackup({ archive });
  revalidatePath("/admin/backup");
  return result;
}

export async function listBackupsAction() {
  await requireOwner();
  return listBackups(process.cwd());
}

"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth-server";
import { roles, type AppRole } from "@/lib/permissions";
import {
  deleteLocalTeacherPhoto,
  isAllowedImageType,
  saveLocalTeacherPhoto,
  TEACHER_PHOTO_MAX_BYTES,
  type TeacherPhotoVariant,
} from "@/lib/teacher-photo-files";

async function requireTeacherPhotoPermission() {
  const session = await requireSession();
  const role: AppRole = session.user.role === "owner" ? "owner" : "editor";
  const canUpdate = roles[role].authorize({ teacher: ["update"] }).success;
  const canCreate = roles[role].authorize({ teacher: ["create"] }).success;
  if (!canUpdate && !canCreate) throw new Error("Forbidden");
  return session;
}

export async function uploadTeacherPhotoAction(
  slug: string,
  formData: FormData,
  variant: TeacherPhotoVariant = "portrait",
) {
  await requireTeacherPhotoPermission();

  const normalizedSlug = slug.trim();
  if (!normalizedSlug) throw new Error("Teacher slug is required before uploading a photo.");

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Choose an image file to upload.");
  }
  if (file.size > TEACHER_PHOTO_MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }
  if (!isAllowedImageType(file.type)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = saveLocalTeacherPhoto(normalizedSlug, buffer, file.type, variant);

  revalidatePath(`/teacher/${normalizedSlug}`);
  revalidatePath("/teachers");

  return { path };
}

export async function deleteTeacherPhotoAction(slug: string, photoPath: string) {
  await requireTeacherPhotoPermission();

  if (photoPath.startsWith("/teachers/")) {
    deleteLocalTeacherPhoto(photoPath);
  }

  revalidatePath(`/teacher/${slug}`);
  revalidatePath("/teachers");

  return { ok: true };
}

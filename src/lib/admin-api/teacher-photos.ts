import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teachers } from "@/db/schema";
import { AdminApiError } from "@/lib/admin-api/errors";
import { isLocalPeoplePhotoPath } from "@/lib/people-photo-paths";
import {
  deleteLocalTeacherPhoto,
  isAllowedImageType,
  resolveImageContentType,
  saveLocalTeacherPhoto,
  TEACHER_PHOTO_MAX_BYTES,
  type TeacherPhotoVariant,
} from "@/lib/teacher-photo-files";

export async function uploadAdminTeacherPhoto(
  slug: string,
  file: File,
  variant: TeacherPhotoVariant = "portrait",
) {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    throw new AdminApiError(400, "Teacher slug is required.");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new AdminApiError(400, "Choose an image file to upload.");
  }
  if (file.size > TEACHER_PHOTO_MAX_BYTES) {
    throw new AdminApiError(400, "Image must be 5 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const contentType = resolveImageContentType(buffer, file.type);
  if (!isAllowedImageType(contentType)) {
    throw new AdminApiError(400, "Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }

  const path = saveLocalTeacherPhoto(normalizedSlug, buffer, contentType, variant);

  const [existing] = await db
    .select({ slug: teachers.slug })
    .from(teachers)
    .where(eq(teachers.slug, normalizedSlug))
    .limit(1);

  if (existing) {
    const patch =
      variant === "hero"
        ? { heroPhoto: path, updatedAt: new Date() }
        : { photo: path, updatedAt: new Date() };
    await db.update(teachers).set(patch).where(eq(teachers.slug, normalizedSlug));
  }

  return { path, variant };
}

export async function deleteAdminTeacherPhoto(slug: string, photoPath: string) {
  if (!photoPath.trim()) {
    throw new AdminApiError(400, "Photo path is required.");
  }

  if (isLocalPeoplePhotoPath(photoPath)) {
    deleteLocalTeacherPhoto(photoPath);
  }

  const [existing] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.slug, slug))
    .limit(1);

  if (existing) {
    const patch: Partial<typeof existing> = { updatedAt: new Date() };
    if (existing.photo === photoPath) patch.photo = "";
    if (existing.heroPhoto === photoPath) patch.heroPhoto = null;
    await db.update(teachers).set(patch).where(eq(teachers.slug, slug));
  }

  return { ok: true as const, path: photoPath };
}

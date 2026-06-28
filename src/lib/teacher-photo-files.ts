import "server-only";

import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TEACHERS_DIR = join(process.cwd(), "public/teachers");

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const ALLOWED_TYPES = new Set(Object.keys(EXT_BY_TYPE));
const MAX_BYTES = 5 * 1024 * 1024;

export function extFromContentType(contentType: string): string {
  const base = contentType.split(";")[0].trim().toLowerCase();
  return EXT_BY_TYPE[base] ?? ".jpg";
}

export function isAllowedImageType(contentType: string): boolean {
  const base = contentType.split(";")[0].trim().toLowerCase();
  if (!base) return false;
  return ALLOWED_TYPES.has(base);
}

export function inferImageType(buffer: Buffer): string | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 6 &&
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function resolveImageContentType(buffer: Buffer, declaredType: string): string {
  const normalized = declaredType.split(";")[0].trim().toLowerCase();
  if (normalized && isAllowedImageType(normalized)) return normalized;
  return inferImageType(buffer) ?? normalized;
}

export { MAX_BYTES as TEACHER_PHOTO_MAX_BYTES };

export function localTeacherPhotoDiskPath(webPath: string): string | null {
  if (!webPath.startsWith("/teachers/")) return null;
  const relative = webPath.slice(1);
  if (relative.includes("..")) return null;
  return join(process.cwd(), "public", relative);
}

export type TeacherPhotoVariant = "portrait" | "hero";

function filenamePrefix(slug: string, variant: TeacherPhotoVariant): string {
  return variant === "hero" ? `${slug}-hero.` : `${slug}.`;
}

export function deleteLocalTeacherPhoto(webPath: string): void {
  const diskPath = localTeacherPhotoDiskPath(webPath);
  if (diskPath && existsSync(diskPath)) {
    unlinkSync(diskPath);
  }
}

export function deleteLocalTeacherPhotoVariant(slug: string, variant: TeacherPhotoVariant): void {
  if (!existsSync(TEACHERS_DIR)) return;
  const prefix = filenamePrefix(slug, variant);
  for (const file of readdirSync(TEACHERS_DIR)) {
    if (file.startsWith(prefix)) {
      unlinkSync(join(TEACHERS_DIR, file));
    }
  }
}

export function deleteAllLocalPhotosForSlug(slug: string): void {
  deleteLocalTeacherPhotoVariant(slug, "portrait");
  deleteLocalTeacherPhotoVariant(slug, "hero");
}

export function saveLocalTeacherPhoto(
  slug: string,
  buffer: Buffer,
  contentType: string,
  variant: TeacherPhotoVariant = "portrait",
): string {
  if (!isAllowedImageType(contentType)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  mkdirSync(TEACHERS_DIR, { recursive: true });
  deleteLocalTeacherPhotoVariant(slug, variant);

  const ext = extFromContentType(contentType);
  const filename = variant === "hero" ? `${slug}-hero${ext}` : `${slug}${ext}`;
  writeFileSync(join(TEACHERS_DIR, filename), buffer);
  return `/teachers/${filename}`;
}

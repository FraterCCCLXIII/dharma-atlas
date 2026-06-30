import "server-only";

import { existsSync, mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  isLocalPeoplePhotoPath,
  PEOPLE_PHOTO_PREFIX,
} from "@/lib/people-photo-paths";

const PEOPLE_DIR = join(process.cwd(), "public/people");
const LEGACY_PEOPLE_PHOTO_PREFIX = "/teachers/";

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
  if (!isLocalPeoplePhotoPath(webPath)) return null;
  const relative = webPath.startsWith(PEOPLE_PHOTO_PREFIX)
    ? webPath.slice(PEOPLE_PHOTO_PREFIX.length)
    : webPath.slice(LEGACY_PEOPLE_PHOTO_PREFIX.length);
  if (relative.includes("..")) return null;
  return join(PEOPLE_DIR, relative);
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
  if (!existsSync(PEOPLE_DIR)) return;
  const prefix = filenamePrefix(slug, variant);
  for (const file of readdirSync(PEOPLE_DIR)) {
    if (file.startsWith(prefix)) {
      unlinkSync(join(PEOPLE_DIR, file));
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

  mkdirSync(PEOPLE_DIR, { recursive: true });
  deleteLocalTeacherPhotoVariant(slug, variant);

  const ext = extFromContentType(contentType);
  const filename = variant === "hero" ? `${slug}-hero${ext}` : `${slug}${ext}`;
  writeFileSync(join(PEOPLE_DIR, filename), buffer);
  return `${PEOPLE_PHOTO_PREFIX}${filename}`;
}

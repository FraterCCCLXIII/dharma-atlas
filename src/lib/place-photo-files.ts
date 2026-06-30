import "server-only";

import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  extFromContentType,
  inferImageType,
  isAllowedImageType,
  resolveImageContentType,
} from "@/lib/teacher-photo-files";

const PLACES_DIR = join(process.cwd(), "public/places");
const MAX_BYTES = 5 * 1024 * 1024;

export { MAX_BYTES as PLACE_PHOTO_MAX_BYTES };
export { isAllowedImageType, resolveImageContentType };

export function localPlacePhotoDiskPath(webPath: string): string | null {
  if (!webPath.startsWith("/places/")) return null;
  const relative = webPath.slice(1);
  if (relative.includes("..")) return null;
  return join(process.cwd(), "public", relative);
}

export function deleteLocalPlacePhoto(webPath: string): void {
  const diskPath = localPlacePhotoDiskPath(webPath);
  if (diskPath && existsSync(diskPath)) {
    unlinkSync(diskPath);
  }
}

export function saveLocalPlacePhoto(
  placeId: string,
  fileKey: string,
  buffer: Buffer,
  contentType: string,
): string {
  if (!isAllowedImageType(contentType)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  mkdirSync(PLACES_DIR, { recursive: true });
  const ext = extFromContentType(contentType);
  const filename = `${placeId}-${fileKey}${ext}`;
  writeFileSync(join(PLACES_DIR, filename), buffer);
  return `/places/${filename}`;
}

export function isAdminUploadedPlacePhoto(path: string, placeId: string): boolean {
  return path.startsWith(`/places/${placeId}-`) && !path.includes("/generated/");
}

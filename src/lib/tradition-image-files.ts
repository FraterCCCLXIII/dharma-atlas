import "server-only";

import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  extFromContentType,
  isAllowedImageType,
} from "@/lib/teacher-photo-files";
import { isLocalTraditionImagePath } from "@/lib/tradition-image-paths";

const TRADITIONS_DIR = join(process.cwd(), "public/traditions");
const MAX_BYTES = 5 * 1024 * 1024;

export { MAX_BYTES as TRADITION_IMAGE_MAX_BYTES };

export function localTraditionImageDiskPath(webPath: string): string | null {
  if (!isLocalTraditionImagePath(webPath)) return null;
  return join(process.cwd(), "public", webPath.slice(1));
}

export function deleteLocalTraditionImage(webPath: string): void {
  const diskPath = localTraditionImageDiskPath(webPath);
  if (diskPath && existsSync(diskPath)) {
    unlinkSync(diskPath);
  }
}

export function saveLocalTraditionImage(
  slug: string,
  buffer: Buffer,
  contentType: string,
): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Invalid slug for tradition image upload.");
  }
  if (!isAllowedImageType(contentType)) {
    throw new Error("Unsupported image type. Use JPEG, PNG, WebP, or GIF.");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("Image must be 5 MB or smaller.");
  }

  mkdirSync(TRADITIONS_DIR, { recursive: true });
  const ext = extFromContentType(contentType);
  const filename = `${slug}${ext}`;
  writeFileSync(join(TRADITIONS_DIR, filename), buffer);
  return `/traditions/${filename}`;
}

import { AdminApiError } from "@/lib/admin-api/errors";
import {
  deleteLocalTraditionImage,
  saveLocalTraditionImage,
  TRADITION_IMAGE_MAX_BYTES,
} from "@/lib/tradition-image-files";

export async function uploadOntologyTraditionImage(slug: string, file: File) {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) {
    throw new AdminApiError(400, "Node slug is required.");
  }
  if (!(file instanceof File) || file.size === 0) {
    throw new AdminApiError(400, "Choose an image file to upload.");
  }
  if (file.size > TRADITION_IMAGE_MAX_BYTES) {
    throw new AdminApiError(400, "Image must be 5 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const path = saveLocalTraditionImage(normalizedSlug, buffer, file.type);
  return { path };
}

export async function deleteOntologyTraditionImage(path: string) {
  const normalizedPath = path.trim();
  if (!normalizedPath) {
    throw new AdminApiError(400, "Image path is required.");
  }

  deleteLocalTraditionImage(normalizedPath);
  return { ok: true as const };
}

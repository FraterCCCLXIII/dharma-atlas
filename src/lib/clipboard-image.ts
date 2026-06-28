import type { ClipboardEvent } from "react";

export function imageFromClipboard(event: ClipboardEvent): File | null {
  const items = event.clipboardData?.items;
  if (!items) return null;

  for (const item of items) {
    if (!item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (!file) continue;
    if (file.type) return file;
    const ext = item.type.includes("png") ? "png" : item.type.includes("jpeg") ? "jpg" : "png";
    return new File([file], `pasted-image.${ext}`, { type: item.type });
  }

  const files = event.clipboardData?.files;
  if (files?.length === 1 && files[0]?.type.startsWith("image/")) {
    return files[0];
  }

  return null;
}

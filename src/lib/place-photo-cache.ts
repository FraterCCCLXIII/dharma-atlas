import { existsSync, statSync } from "fs";
import { join } from "path";

/**
 * Cache key from on-disk mtimes for local public photo paths.
 * Used so next/image does not keep serving a replaced file at the same URL.
 */
export function localPlacePhotoCacheKey(photoPaths: string[]): string {
  let maxMtime = 0;

  for (const raw of photoPaths) {
    const path = raw.split("?")[0]?.trim();
    if (!path?.startsWith("/")) continue;
    if (!path.startsWith("/places/") && !path.startsWith("/traditions/")) continue;

    const diskPath = join(process.cwd(), "public", path.slice(1));
    if (!existsSync(diskPath)) continue;
    maxMtime = Math.max(maxMtime, statSync(diskPath).mtimeMs);
  }

  return maxMtime > 0 ? String(Math.floor(maxMtime)) : "";
}

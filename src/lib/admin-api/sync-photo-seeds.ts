import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

type SyncResult = {
  copied: string[];
  skipped: number;
};

function mergeSeedDirectory(name: "people" | "places"): SyncResult {
  const target = join(process.cwd(), "public", name);
  const seed = join(process.cwd(), ".photo-seed", name);
  const copied: string[] = [];

  mkdirSync(target, { recursive: true });

  if (!existsSync(seed)) {
    return { copied, skipped: 0 };
  }

  let skipped = 0;
  for (const file of readdirSync(seed)) {
    const seedPath = join(seed, file);
    if (!statSync(seedPath).isFile()) continue;

    const targetPath = join(target, file);
    if (existsSync(targetPath)) {
      skipped++;
      continue;
    }

    copyFileSync(seedPath, targetPath);
    copied.push(file);
  }

  return { copied, skipped };
}

export function syncPeoplePhotosFromSeed() {
  return mergeSeedDirectory("people");
}

export function syncPlacePhotosFromSeed() {
  return mergeSeedDirectory("places");
}

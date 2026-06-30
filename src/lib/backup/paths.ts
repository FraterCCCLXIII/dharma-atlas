import { join } from "node:path";

export const BACKUP_DIR_NAME = "backups";
export const PLACES_DIR = join("public", "places");
export const PEOPLE_DIR = join("public", "people");

export function backupDir(rootDir: string): string {
  return join(rootDir, BACKUP_DIR_NAME);
}

export function backupTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

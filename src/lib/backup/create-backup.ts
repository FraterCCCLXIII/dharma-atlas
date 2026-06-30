import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { spawn } from "node:child_process";
import { parseDatabaseUrl } from "./db-url";
import { dumpDatabase } from "./pg-dump";
import {
  BACKUP_DIR_NAME,
  backupDir,
  backupTimestamp,
  PEOPLE_DIR,
  PLACES_DIR,
} from "./paths";

export type BackupManifest = {
  version: 1;
  createdAt: string;
  id: string;
  database: string;
  dumpMethod: "pg_dump" | "docker";
  files: {
    database: string;
    places: string;
    people: string;
  };
  counts: {
    placeImages: number;
    peopleImages: number;
  };
};

export type BackupResult = {
  id: string;
  directory: string;
  archivePath: string | null;
  manifest: BackupManifest;
};

export type CreateBackupOptions = {
  rootDir?: string;
  databaseUrl?: string;
  archive?: boolean;
  outputDir?: string;
};

function countFilesRecursive(dir: string): number {
  if (!existsSync(dir)) return 0;

  let count = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      count += countFilesRecursive(entryPath);
    } else if (entry.isFile()) {
      count += 1;
    }
  }
  return count;
}

function copyDirectory(source: string, destination: string): void {
  if (!existsSync(source)) {
    mkdirSync(destination, { recursive: true });
    return;
  }

  cpSync(source, destination, { recursive: true });
}

function createArchive(sourceDir: string, archivePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "tar",
      ["-czf", archivePath, "-C", join(sourceDir, ".."), basename(sourceDir)],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`tar exited with code ${code}: ${stderr.trim()}`));
    });
  });
}

export async function createBackup(options: CreateBackupOptions = {}): Promise<BackupResult> {
  const rootDir = options.rootDir ?? process.cwd();
  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set.");
  }

  const dbConfig = parseDatabaseUrl(databaseUrl);
  const id = `dharma-atlas-${backupTimestamp()}`;
  const backupsRoot = options.outputDir ?? backupDir(rootDir);
  const directory = join(backupsRoot, id);

  mkdirSync(directory, { recursive: true });

  const databasePath = join(directory, "database.sql");
  const placesDest = join(directory, "places");
  const peopleDest = join(directory, "people");

  const dumpMethod = await dumpDatabase(dbConfig, databasePath);
  copyDirectory(join(rootDir, "public", "places"), placesDest);
  copyDirectory(join(rootDir, "public", "people"), peopleDest);

  const manifest: BackupManifest = {
    version: 1,
    createdAt: new Date().toISOString(),
    id,
    database: dbConfig.database,
    dumpMethod,
    files: {
      database: "database.sql",
      places: "places/",
      people: "people/",
    },
    counts: {
      placeImages: countFilesRecursive(placesDest),
      peopleImages: countFilesRecursive(peopleDest),
    },
  };

  writeFileSync(join(directory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  let archivePath: string | null = null;
  if (options.archive) {
    archivePath = `${directory}.tar.gz`;
    await createArchive(directory, archivePath);
  }

  return { id, directory, archivePath, manifest };
}

export function listBackups(rootDir: string = process.cwd()): BackupManifest[] {
  const dir = backupDir(rootDir);
  if (!existsSync(dir)) return [];

  const backups: BackupManifest[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!entry.name.startsWith("dharma-atlas-") && !entry.name.startsWith("dharma-streams-")) {
      continue;
    }

    const manifestPath = join(dir, entry.name, "manifest.json");
    if (!existsSync(manifestPath)) continue;

    try {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as BackupManifest;
      backups.push(manifest);
    } catch {
      // Skip invalid manifests.
    }
  }

  return backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getBackupPaths(rootDir: string, id: string) {
  const directory = join(backupDir(rootDir), id);
  const archivePath = `${directory}.tar.gz`;
  return { directory, archivePath };
}

export { BACKUP_DIR_NAME };

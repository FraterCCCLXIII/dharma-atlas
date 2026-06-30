import { createReadStream, existsSync } from "node:fs";
import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/auth-server";
import { createBackup, getBackupPaths, listBackups } from "@/lib/backup";

export async function GET(request: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const download = searchParams.get("download") === "1";

  if (id && download) {
    const { directory, archivePath } = getBackupPaths(process.cwd(), id);

    if (!existsSync(archivePath)) {
      if (existsSync(directory)) {
        return NextResponse.json(
          {
            error:
              "Archive not found. Create a backup with archive enabled or run `npm run backup -- --archive`.",
          },
          { status: 404 },
        );
      }
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    const stream = createReadStream(archivePath);
    return new NextResponse(stream as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${id}.tar.gz"`,
      },
    });
  }

  return NextResponse.json({ backups: listBackups(process.cwd()) });
}

export async function POST(request: Request) {
  try {
    await requireOwner();
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let archive = true;
  try {
    const body = (await request.json()) as { archive?: boolean };
    if (typeof body.archive === "boolean") archive = body.archive;
  } catch {
    // Default to archived backups for API downloads.
  }

  try {
    const result = await createBackup({ archive });
    return NextResponse.json({
      id: result.id,
      directory: result.directory,
      archivePath: result.archivePath,
      manifest: result.manifest,
      downloadUrl: result.archivePath
        ? `/api/admin/backup?id=${encodeURIComponent(result.id)}&download=1`
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

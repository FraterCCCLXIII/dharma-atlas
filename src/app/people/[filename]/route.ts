import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { NextResponse } from "next/server";

const PEOPLE_DIR = join(process.cwd(), "public/people");

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

type RouteContext = { params: Promise<{ filename: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  if (!filename || filename.includes("..") || filename.includes("/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = extname(filename).toLowerCase();
  const contentType = MIME_BY_EXT[ext];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  const diskPath = join(PEOPLE_DIR, filename);
  if (!existsSync(diskPath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const buffer = readFileSync(diskPath);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

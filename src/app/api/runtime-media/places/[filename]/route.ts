import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

const CONTENT_TYPE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
};

type RouteContext = {
  params: Promise<{ filename: string }>;
};

/**
 * Serve place photos from disk at request time.
 *
 * Coolify mounts a persistent volume over `public/places`. Next's static
 * handler often 404s files written after the image build; reading from disk
 * here keeps admin uploads and entrypoint seed merges reachable at
 * `/places/<file>` (via middleware rewrite).
 */
export async function GET(_request: Request, context: RouteContext) {
  const { filename } = await context.params;
  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    return new NextResponse("Not found", { status: 404 });
  }

  const diskPath = join(process.cwd(), "public", "places", filename);
  if (!existsSync(diskPath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPE[ext];
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = readFileSync(diskPath);
  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(body.byteLength),
    },
  });
}

import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import { syncPlacePhotosFromSeed } from "@/lib/admin-api/sync-photo-seeds";

export async function POST(request: Request) {
  return withAdminApiAuth(request, async () => {
    const result = syncPlacePhotosFromSeed();
    return NextResponse.json({ ok: true, ...result, count: result.copied.length });
  });
}

import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import { syncPeoplePhotosFromSeed } from "@/lib/admin-api/sync-photo-seeds";

export async function POST(request: Request) {
  return withAdminApiAuth(request, async () => {
    const result = syncPeoplePhotosFromSeed();
    return NextResponse.json({ ok: true, ...result, count: result.copied.length });
  });
}

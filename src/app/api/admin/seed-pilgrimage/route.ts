import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import { revalidateAllContentPaths } from "@/lib/admin-api/revalidate";
import { seedPilgrimagePlaces } from "@/lib/seed/seed-pilgrimage-places";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  return withAdminApiAuth(request, async () => {
    // App db includes the full schema; seed helper only needs a drizzle client.
    const result = await seedPilgrimagePlaces(
      db as Parameters<typeof seedPilgrimagePlaces>[0],
    );
    revalidateAllContentPaths();
    revalidatePath("/pilgrimage");
    revalidatePath("/pilgrimage", "layout");
    return NextResponse.json({ ok: true, ...result });
  });
}

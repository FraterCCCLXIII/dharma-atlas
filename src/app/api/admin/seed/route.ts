import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import { revalidateAllContentPaths } from "@/lib/admin-api/revalidate";
import { runDataSeed, type SeedOptions } from "@/lib/seed/run-seed";

export async function POST(request: Request) {
  return withAdminApiAuth(request, async () => {
    const body = (await request.json()) as SeedOptions;
    const result = await runDataSeed(body);
    revalidateAllContentPaths();
    return NextResponse.json({ ok: true, ...result });
  });
}

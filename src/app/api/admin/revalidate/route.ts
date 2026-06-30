import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import { revalidateAllContentPaths } from "@/lib/admin-api/revalidate";

export async function POST(request: Request) {
  return withAdminApiAuth(request, async () => {
    const body = (await request.json()) as { paths?: string[]; all?: boolean };

    if (body.all) {
      revalidateAllContentPaths();
      return NextResponse.json({ ok: true, revalidated: "all" });
    }

    const paths = body.paths ?? [];
    for (const path of paths) {
      revalidatePath(path);
    }

    return NextResponse.json({ ok: true, revalidated: paths.length });
  });
}

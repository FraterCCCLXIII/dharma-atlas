import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import { createAdminPlace, listAdminPlaces } from "@/lib/admin-api/places";
import { revalidateAllContentPaths } from "@/lib/admin-api/revalidate";

export async function GET(request: Request) {
  return withAdminApiAuth(request, async () => {
    const places = await listAdminPlaces();
    return NextResponse.json({ places, count: places.length });
  });
}

export async function POST(request: Request) {
  return withAdminApiAuth(request, async () => {
    const body = await request.json();
    const place = await createAdminPlace(body);
    revalidateAllContentPaths();
    if (place) {
      return NextResponse.json({ place }, { status: 201 });
    }
    return NextResponse.json({ error: "Failed to create place" }, { status: 500 });
  });
}

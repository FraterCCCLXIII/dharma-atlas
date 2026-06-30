import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import {
  deleteAdminPlace,
  getAdminPlace,
  updateAdminPlace,
  verifyAdminPlaceField,
} from "@/lib/admin-api/places";
import { revalidatePlacePaths } from "@/lib/admin-api/revalidate";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { id } = await context.params;
    const place = await getAdminPlace(id);
    if (!place) {
      return NextResponse.json({ error: "Place not found" }, { status: 404 });
    }
    return NextResponse.json({ place });
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { id } = await context.params;
    const body = await request.json();

    if (body && typeof body === "object" && "verifyField" in body) {
      const field = String((body as { verifyField: string }).verifyField);
      const place = await verifyAdminPlaceField(id, field);
      revalidatePlacePaths(id);
      return NextResponse.json({ place });
    }

    const place = await updateAdminPlace(id, body);
    revalidatePlacePaths(id);
    return NextResponse.json({ place });
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { id } = await context.params;
    const result = await deleteAdminPlace(id);
    revalidatePlacePaths(id);
    return NextResponse.json(result);
  });
}

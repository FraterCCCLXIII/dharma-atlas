import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import { deleteAdminPlacePhoto } from "@/lib/admin-api/place-photos";
import { revalidatePlacePaths } from "@/lib/admin-api/revalidate";

type RouteContext = { params: Promise<{ id: string; photoId: string }> };

export async function DELETE(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { id, photoId } = await context.params;
    const numericPhotoId = Number(photoId);
    if (!Number.isInteger(numericPhotoId)) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    const result = await deleteAdminPlacePhoto(id, numericPhotoId);
    revalidatePlacePaths(id);
    return NextResponse.json(result);
  });
}

import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import {
  listAdminPlacePhotos,
  uploadAdminPlacePhoto,
} from "@/lib/admin-api/place-photos";
import { revalidatePlacePaths } from "@/lib/admin-api/revalidate";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { id } = await context.params;
    const photos = await listAdminPlacePhotos(id);
    return NextResponse.json({ photos, count: photos.length });
  });
}

export async function POST(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { id } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field in multipart form data." }, { status: 400 });
    }

    const result = await uploadAdminPlacePhoto(id, file);
    revalidatePlacePaths(id);
    return NextResponse.json(result, { status: 201 });
  });
}

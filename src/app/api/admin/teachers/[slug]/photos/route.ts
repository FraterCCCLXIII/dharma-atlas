import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import {
  deleteAdminTeacherPhoto,
  uploadAdminTeacherPhoto,
} from "@/lib/admin-api/teacher-photos";
import type { TeacherPhotoVariant } from "@/lib/teacher-photo-files";
import { revalidateTeacherPaths } from "@/lib/admin-api/revalidate";

type RouteContext = { params: Promise<{ slug: string }> };

function parseVariant(value: FormDataEntryValue | null): TeacherPhotoVariant {
  const variant = String(value ?? "portrait");
  return variant === "hero" ? "hero" : "portrait";
}

export async function POST(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { slug } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");
    const variant = parseVariant(formData.get("variant"));

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field in multipart form data." }, { status: 400 });
    }

    const result = await uploadAdminTeacherPhoto(slug, file, variant);
    revalidateTeacherPaths(slug);
    return NextResponse.json(result, { status: 201 });
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { slug } = await context.params;
    const body = (await request.json()) as { path?: string };
    if (!body.path) {
      return NextResponse.json({ error: "Photo path is required." }, { status: 400 });
    }

    const result = await deleteAdminTeacherPhoto(slug, body.path);
    revalidateTeacherPaths(slug);
    return NextResponse.json(result);
  });
}

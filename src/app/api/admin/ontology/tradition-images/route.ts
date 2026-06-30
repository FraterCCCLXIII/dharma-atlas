import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import {
  deleteOntologyTraditionImage,
  uploadOntologyTraditionImage,
} from "@/lib/admin-api/ontology-tradition-images";

export async function POST(request: Request) {
  return withAdminApiAuth(request, async () => {
    const formData = await request.formData();
    const slug = formData.get("slug");
    const file = formData.get("file");

    if (typeof slug !== "string" || !slug.trim()) {
      return NextResponse.json({ error: "Missing slug." }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field in multipart form data." }, { status: 400 });
    }

    const result = await uploadOntologyTraditionImage(slug, file);
    return NextResponse.json(result, { status: 201 });
  });
}

export async function DELETE(request: Request) {
  return withAdminApiAuth(request, async () => {
    const body = (await request.json()) as { path?: string };
    if (!body.path?.trim()) {
      return NextResponse.json({ error: "Missing path." }, { status: 400 });
    }

    await deleteOntologyTraditionImage(body.path);
    return NextResponse.json({ ok: true });
  });
}

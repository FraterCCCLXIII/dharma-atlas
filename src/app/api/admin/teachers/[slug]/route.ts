import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import {
  deleteAdminTeacher,
  getAdminTeacher,
  updateAdminTeacher,
} from "@/lib/admin-api/teachers";
import { revalidateTeacherPaths } from "@/lib/admin-api/revalidate";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { slug } = await context.params;
    const teacher = await getAdminTeacher(slug);
    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }
    return NextResponse.json({ teacher });
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { slug } = await context.params;
    const body = await request.json();
    const teacher = await updateAdminTeacher(slug, body);
    revalidateTeacherPaths(teacher?.slug ?? slug, slug);
    return NextResponse.json({ teacher });
  });
}

export async function DELETE(request: Request, context: RouteContext) {
  return withAdminApiAuth(request, async () => {
    const { slug } = await context.params;
    const result = await deleteAdminTeacher(slug);
    revalidateTeacherPaths(slug);
    return NextResponse.json(result);
  });
}

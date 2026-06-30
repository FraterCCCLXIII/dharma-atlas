import { NextResponse } from "next/server";
import { withAdminApiAuth } from "@/lib/admin-api/handler";
import { createAdminTeacher, listAdminTeachers } from "@/lib/admin-api/teachers";
import { revalidateAllContentPaths } from "@/lib/admin-api/revalidate";

export async function GET(request: Request) {
  return withAdminApiAuth(request, async () => {
    const teachers = await listAdminTeachers();
    return NextResponse.json({ teachers, count: teachers.length });
  });
}

export async function POST(request: Request) {
  return withAdminApiAuth(request, async () => {
    const body = await request.json();
    const teacher = await createAdminTeacher(body);
    revalidateAllContentPaths();
    if (teacher) {
      return NextResponse.json({ teacher }, { status: 201 });
    }
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  });
}

import { NextResponse } from "next/server";
import { getCachedExploreTeachers } from "@/lib/data/teachers";

export async function GET() {
  const teachers = await getCachedExploreTeachers();

  return NextResponse.json(
    { teachers, count: teachers.length },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}

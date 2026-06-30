import { NextResponse } from "next/server";
import { searchTeachers } from "@/lib/data/teachers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? "50") || 50);

  const result = await searchTeachers({ query, page, pageSize, publishedOnly: true });
  return NextResponse.json(result);
}

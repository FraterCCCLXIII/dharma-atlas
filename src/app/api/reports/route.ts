import { NextResponse } from "next/server";
import { createReport } from "@/lib/data/reports";
import { publicReportSchema } from "@/lib/validations/report";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = publicReportSchema.parse(body);

    await createReport({
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      entityPath: data.entityPath,
      reason: data.reason,
      details: data.details?.trim() || undefined,
      submitterEmail: data.submitterEmail,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid report";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

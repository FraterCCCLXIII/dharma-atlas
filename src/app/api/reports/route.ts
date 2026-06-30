import { NextResponse } from "next/server";
import { createReport } from "@/lib/data/reports";
import { notifyNewReport } from "@/lib/email";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { publicReportSchema } from "@/lib/validations/report";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit({ key: `reports:${ip}`, limit: 10 });
  if (!limited.allowed) return rateLimitResponse(limited.retryAfterMs);

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

    await notifyNewReport({
      entityName: data.entityName,
      reason: data.reason,
      submitterEmail: data.submitterEmail,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid report";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { createSubmission } from "@/lib/data/submissions";
import { notifyNewSubmission } from "@/lib/email";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import {
  composeSubmissionNotes,
  publicSubmissionSchema,
} from "@/lib/validations/submission";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit({ key: `submissions:${ip}`, limit: 10 });
  if (!limited.allowed) return rateLimitResponse(limited.retryAfterMs);

  try {
    const body = await request.json();
    const data = publicSubmissionSchema.parse(body);

    await createSubmission({
      entryType: data.entryType,
      submitterName: data.submitterName,
      submitterEmail: data.submitterEmail,
      name: data.name,
      location: data.location || undefined,
      website: data.website || undefined,
      notes: composeSubmissionNotes(data),
      payload: data,
    });

    await notifyNewSubmission({
      entryType: data.entryType,
      name: data.name,
      submitterEmail: data.submitterEmail,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid submission";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

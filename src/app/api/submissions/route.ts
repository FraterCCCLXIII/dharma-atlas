import { NextResponse } from "next/server";
import { createSubmission } from "@/lib/data/submissions";
import {
  composeSubmissionNotes,
  publicSubmissionSchema,
} from "@/lib/validations/submission";

export async function POST(request: Request) {
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
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid submission";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

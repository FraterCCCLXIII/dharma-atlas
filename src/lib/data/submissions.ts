import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { submissions } from "@/db/schema";

export type SubmissionEntryType = "teacher" | "location";
export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface Submission {
  id: number;
  entryType: SubmissionEntryType;
  status: SubmissionStatus;
  submitterName: string;
  submitterEmail: string;
  name: string;
  location: string | null;
  website: string | null;
  notes: string | null;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

function rowToSubmission(row: typeof submissions.$inferSelect): Submission {
  return {
    id: row.id,
    entryType: row.entryType as SubmissionEntryType,
    status: row.status as SubmissionStatus,
    submitterName: row.submitterName,
    submitterEmail: row.submitterEmail,
    name: row.name,
    location: row.location,
    website: row.website,
    notes: row.notes,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
  };
}

export async function getPendingSubmissionsCount() {
  const [row] = await db
    .select({ count: count() })
    .from(submissions)
    .where(eq(submissions.status, "pending"));
  return row?.count ?? 0;
}

export async function getSubmissions(status?: SubmissionStatus): Promise<Submission[]> {
  const rows = status
    ? await db
        .select()
        .from(submissions)
        .where(eq(submissions.status, status))
        .orderBy(desc(submissions.createdAt))
    : await db.select().from(submissions).orderBy(desc(submissions.createdAt));
  return rows.map(rowToSubmission);
}

export async function getSubmissionById(id: number): Promise<Submission | null> {
  const [row] = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
  return row ? rowToSubmission(row) : null;
}

export async function createSubmission(data: {
  entryType: SubmissionEntryType;
  submitterName: string;
  submitterEmail: string;
  name: string;
  location?: string;
  website?: string;
  notes?: string;
}) {
  const [row] = await db
    .insert(submissions)
    .values({
      entryType: data.entryType,
      submitterName: data.submitterName,
      submitterEmail: data.submitterEmail,
      name: data.name,
      location: data.location ?? null,
      website: data.website ?? null,
      notes: data.notes ?? null,
      status: "pending",
    })
    .returning();
  return rowToSubmission(row!);
}

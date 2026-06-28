import "server-only";

import { count, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { reports } from "@/db/schema";

export type ReportEntityType = "location" | "teacher";
export type ReportStatus = "pending" | "reviewed" | "dismissed";

export interface Report {
  id: number;
  entityType: ReportEntityType;
  entityId: string;
  entityName: string;
  entityPath: string;
  reason: string;
  details: string | null;
  submitterEmail: string;
  status: ReportStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

function rowToReport(row: typeof reports.$inferSelect): Report {
  return {
    id: row.id,
    entityType: row.entityType as ReportEntityType,
    entityId: row.entityId,
    entityName: row.entityName,
    entityPath: row.entityPath,
    reason: row.reason,
    details: row.details,
    submitterEmail: row.submitterEmail,
    status: row.status as ReportStatus,
    reviewedBy: row.reviewedBy,
    reviewedAt: row.reviewedAt,
    createdAt: row.createdAt,
  };
}

export async function getPendingReportsCount() {
  const [row] = await db
    .select({ count: count() })
    .from(reports)
    .where(eq(reports.status, "pending"));
  return row?.count ?? 0;
}

export async function getReports(status?: ReportStatus): Promise<Report[]> {
  const rows = status
    ? await db
        .select()
        .from(reports)
        .where(eq(reports.status, status))
        .orderBy(desc(reports.createdAt))
    : await db.select().from(reports).orderBy(desc(reports.createdAt));
  return rows.map(rowToReport);
}

export async function createReport(data: {
  entityType: ReportEntityType;
  entityId: string;
  entityName: string;
  entityPath: string;
  reason: string;
  details?: string;
  submitterEmail: string;
}) {
  const [row] = await db
    .insert(reports)
    .values({
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      entityPath: data.entityPath,
      reason: data.reason,
      details: data.details ?? null,
      submitterEmail: data.submitterEmail,
      status: "pending",
    })
    .returning();
  return rowToReport(row!);
}

export async function updateReportStatus(
  id: number,
  status: ReportStatus,
  reviewedBy: string,
) {
  const [row] = await db
    .update(reports)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
    })
    .where(eq(reports.id, id))
    .returning();
  return row ? rowToReport(row) : null;
}

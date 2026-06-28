export const locationReportReasons = [
  "incorrect-location",
  "wrong-tradition",
  "permanently-closed",
  "duplicate",
  "not-valid",
  "other",
] as const;

export const teacherReportReasons = [
  "incorrect-info",
  "wrong-tradition",
  "deceased-update",
  "spam-impersonation",
  "duplicate",
  "not-valid",
  "other",
] as const;

export type LocationReportReason = (typeof locationReportReasons)[number];
export type TeacherReportReason = (typeof teacherReportReasons)[number];
export type ReportReason = LocationReportReason | TeacherReportReason;

export const locationReportReasonLabels: Record<LocationReportReason, string> = {
  "incorrect-location": "Incorrect address or map location",
  "wrong-tradition": "Wrong tradition or lineage",
  "permanently-closed": "Place is permanently closed",
  duplicate: "Duplicate listing",
  "not-valid": "Not a valid directory entry",
  other: "Other",
};

export const teacherReportReasonLabels: Record<TeacherReportReason, string> = {
  "incorrect-info": "Incorrect biography, dates, or details",
  "wrong-tradition": "Wrong tradition or lineage",
  "deceased-update": "Teacher has passed away (needs update)",
  "spam-impersonation": "Spam or impersonation",
  duplicate: "Duplicate listing",
  "not-valid": "Not a valid directory entry",
  other: "Other",
};

export function reportReasonLabel(entityType: "location" | "teacher", reason: string): string {
  if (entityType === "location") {
    return locationReportReasonLabels[reason as LocationReportReason] ?? reason;
  }
  return teacherReportReasonLabels[reason as TeacherReportReason] ?? reason;
}

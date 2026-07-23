export type CalendarImportSourceType = "ics" | "csv";

/** Normalized one-time event ready to upsert into place_events. */
export interface ImportedCalendarEvent {
  externalUid: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  timezone: string;
  url?: string;
}

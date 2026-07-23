import ical from "node-ical";
import type { ImportedCalendarEvent } from "@/lib/calendar-import/types";

const MS_DAY = 24 * 60 * 60 * 1000;
const MAX_IMPORTED = 100;

type IcsEvent = {
  type?: string;
  uid?: string;
  summary?: string;
  description?: string;
  url?: string | { val?: string };
  start?: Date & { tz?: string };
  end?: Date & { tz?: string };
  rrule?: unknown;
};

function asDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function cleanText(value: unknown): string | undefined {
  if (typeof value === "object" && value && "val" in value) {
    return cleanText((value as { val?: unknown }).val);
  }
  if (typeof value !== "string") return undefined;
  const trimmed = value.replace(/\\n/g, "\n").trim();
  return trimmed || undefined;
}

function timezoneOf(start: (Date & { tz?: string }) | undefined, fallback: string): string {
  return start?.tz || fallback || "UTC";
}

/** Parse ICS text into dated events (expands simple recurring series in a window). */
export function parseIcsCalendar(
  icsText: string,
  options?: { from?: Date; to?: Date; defaultTimezone?: string },
): ImportedCalendarEvent[] {
  const from = options?.from ?? new Date(Date.now() - 14 * MS_DAY);
  const to = options?.to ?? new Date(Date.now() + 180 * MS_DAY);
  const defaultTimezone = options?.defaultTimezone ?? "America/Los_Angeles";
  const data = ical.parseICS(icsText);
  const imported: ImportedCalendarEvent[] = [];

  for (const value of Object.values(data)) {
    const event = value as IcsEvent;
    if (event.type !== "VEVENT") continue;

    const title = cleanText(event.summary) || "Untitled event";
    const description = cleanText(event.description);
    const url = cleanText(event.url);
    const baseUid = cleanText(event.uid) || `ics-${title}-${String(event.start)}`;

    if (event.rrule) {
      try {
        const occurrences = ical.expandRecurringEvent(event as never, { from, to });
        for (const occurrence of occurrences) {
          const start = asDate(occurrence.start);
          if (!start) continue;
          const end = asDate(occurrence.end) ?? undefined;
          const timezone = timezoneOf(
            occurrence.start as Date & { tz?: string },
            defaultTimezone,
          );
          imported.push({
            externalUid: `${baseUid}::${start.toISOString()}`,
            title,
            description,
            startsAt: start.toISOString(),
            endsAt: end?.toISOString(),
            timezone,
            url,
          });
          if (imported.length >= MAX_IMPORTED) return imported;
        }
      } catch {
        // Fall through — skip series if expansion fails.
      }
      continue;
    }

    const start = asDate(event.start);
    if (!start) continue;
    if (start < from || start > to) continue;
    const end = asDate(event.end) ?? undefined;
    const timezone = timezoneOf(event.start, defaultTimezone);
    imported.push({
      externalUid: baseUid,
      title,
      description,
      startsAt: start.toISOString(),
      endsAt: end?.toISOString(),
      timezone,
      url,
    });
    if (imported.length >= MAX_IMPORTED) break;
  }

  return imported.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export async function fetchAndParseIcsUrl(
  url: string,
  options?: { defaultTimezone?: string },
): Promise<ImportedCalendarEvent[]> {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Calendar URL must start with http:// or https://");
  }

  const response = await fetch(trimmed, {
    headers: {
      Accept: "text/calendar, text/plain, */*",
      "User-Agent": "DharmaAtlasCalendarImport/1.0",
    },
    signal: AbortSignal.timeout(20_000),
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(`Could not fetch calendar (HTTP ${response.status})`);
  }

  const text = await response.text();
  if (!/BEGIN:VCALENDAR/i.test(text) && !/BEGIN:VEVENT/i.test(text)) {
    throw new Error("That URL did not return a valid ICS calendar file.");
  }

  return parseIcsCalendar(text, { defaultTimezone: options?.defaultTimezone });
}

import type {
  PlaceEvent,
  PlaceEventKind,
  PlaceEventOccurrence,
  PlaceMonthWeek,
  PlaceScheduleRule,
  PlaceWeekday,
} from "@/types/place";

const MS_DAY = 24 * 60 * 60 * 1000;
/** When an event has no end time, keep it listed this long after it starts. */
const DEFAULT_VISIBLE_AFTER_START_MS = 12 * 60 * 60 * 1000;

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const MONTH_WEEK_LABELS: Record<PlaceMonthWeek, string> = {
  1: "1st",
  2: "2nd",
  3: "3rd",
  4: "4th",
  [-1]: "Last",
};

export function parseTimeParts(value: string): { hour: number; minute: number } | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

/** Convert a wall-clock date/time in `timeZone` to a UTC Date. */
export function wallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, 0);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(utcGuess))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;
  const asWall = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second ?? "0"),
  );
  return new Date(utcGuess - (asWall - utcGuess));
}

function ymdInZone(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<string, string>;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
  };
}

function weekdayInZone(date: Date, timeZone: string): PlaceWeekday {
  const label = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
  const index = WEEKDAY_LABELS.indexOf(label as (typeof WEEKDAY_LABELS)[number]);
  return (index >= 0 ? index : 0) as PlaceWeekday;
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function nthWeekdayDate(
  year: number,
  month: number,
  weekday: PlaceWeekday,
  week: PlaceMonthWeek,
  timeZone: string,
): { year: number; month: number; day: number } | null {
  const matches: number[] = [];
  const total = daysInMonth(year, month);
  for (let day = 1; day <= total; day += 1) {
    const probe = wallTimeToUtc(year, month, day, 12, 0, timeZone);
    if (weekdayInZone(probe, timeZone) === weekday) matches.push(day);
  }
  if (matches.length === 0) return null;
  const day =
    week === -1
      ? matches[matches.length - 1]
      : matches[week - 1];
  if (day == null) return null;
  return { year, month, day };
}

function scheduleDurationMs(event: PlaceEvent): number {
  if (!event.startTime || !event.endTime) return 0;
  const start = parseTimeParts(event.startTime);
  const end = parseTimeParts(event.endTime);
  if (!start || !end) return 0;
  const startMin = start.hour * 60 + start.minute;
  const endMin = end.hour * 60 + end.minute;
  if (endMin <= startMin) return 0;
  return (endMin - startMin) * 60 * 1000;
}

function occurrenceEndMs(start: Date, endsAt: string | undefined, durationMs: number): number {
  if (endsAt) return new Date(endsAt).getTime();
  if (durationMs > 0) return start.getTime() + durationMs;
  return start.getTime() + DEFAULT_VISIBLE_AFTER_START_MS;
}

function buildScheduleOccurrence(
  event: PlaceEvent,
  year: number,
  month: number,
  day: number,
): PlaceEventOccurrence | null {
  if (!event.startTime) return null;
  const startParts = parseTimeParts(event.startTime);
  if (!startParts) return null;
  const start = wallTimeToUtc(
    year,
    month,
    day,
    startParts.hour,
    startParts.minute,
    event.timezone,
  );
  const durationMs = scheduleDurationMs(event);
  const endsAt =
    durationMs > 0 ? new Date(start.getTime() + durationMs).toISOString() : undefined;
  return {
    event,
    startsAt: start.toISOString(),
    endsAt,
  };
}

function expandScheduleOccurrences(
  event: PlaceEvent,
  from: Date,
  until: Date,
): PlaceEventOccurrence[] {
  if (!event.rule || !event.startTime) return [];
  const fromMs = from.getTime();
  const untilMs = until.getTime();
  const durationMs = scheduleDurationMs(event);
  const out: PlaceEventOccurrence[] = [];
  const startYmd = ymdInZone(from, event.timezone);
  const endYmd = ymdInZone(until, event.timezone);

  if (event.rule.freq === "weekly") {
    const days = new Set(event.rule.daysOfWeek);
    let cursor = Date.UTC(startYmd.year, startYmd.month - 1, startYmd.day);
    const endCursor = Date.UTC(endYmd.year, endYmd.month - 1, endYmd.day);
    let guard = 0;
    while (cursor <= endCursor && guard < 400) {
      const year = new Date(cursor).getUTCFullYear();
      const month = new Date(cursor).getUTCMonth() + 1;
      const day = new Date(cursor).getUTCDate();
      const noon = wallTimeToUtc(year, month, day, 12, 0, event.timezone);
      if (days.has(weekdayInZone(noon, event.timezone))) {
        const occurrence = buildScheduleOccurrence(event, year, month, day);
        if (occurrence) {
          const endMs = occurrenceEndMs(
            new Date(occurrence.startsAt),
            occurrence.endsAt,
            durationMs,
          );
          if (endMs >= fromMs && new Date(occurrence.startsAt).getTime() <= untilMs) {
            out.push(occurrence);
          }
        }
      }
      cursor += MS_DAY;
      guard += 1;
    }
    return out;
  }

  // monthlyNth
  let year = startYmd.year;
  let month = startYmd.month;
  let guard = 0;
  while (guard < 36) {
    if (year > endYmd.year || (year === endYmd.year && month > endYmd.month)) break;
    const match = nthWeekdayDate(
      year,
      month,
      event.rule.weekday,
      event.rule.week,
      event.timezone,
    );
    if (match) {
      const occurrence = buildScheduleOccurrence(event, match.year, match.month, match.day);
      if (occurrence) {
        const endMs = occurrenceEndMs(
          new Date(occurrence.startsAt),
          occurrence.endsAt,
          durationMs,
        );
        if (endMs >= fromMs && new Date(occurrence.startsAt).getTime() <= untilMs) {
          out.push(occurrence);
        }
      }
    }
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    guard += 1;
  }
  return out;
}

function expandOneTimeOccurrence(
  event: PlaceEvent,
  fromMs: number,
  untilMs: number,
): PlaceEventOccurrence | null {
  if (!event.startsAt) return null;
  const start = new Date(event.startsAt);
  if (Number.isNaN(start.getTime())) return null;
  const durationMs =
    event.endsAt != null
      ? Math.max(0, new Date(event.endsAt).getTime() - start.getTime())
      : 0;
  const endMs = occurrenceEndMs(start, event.endsAt, durationMs);
  if (endMs < fromMs || start.getTime() > untilMs) return null;
  return {
    event,
    startsAt: start.toISOString(),
    endsAt: event.endsAt,
  };
}

function isPastOneTime(event: PlaceEvent, fromMs: number): boolean {
  if (event.kind !== "event" || !event.startsAt) return false;
  const start = new Date(event.startsAt);
  if (Number.isNaN(start.getTime())) return false;
  const durationMs =
    event.endsAt != null
      ? Math.max(0, new Date(event.endsAt).getTime() - start.getTime())
      : 0;
  return occurrenceEndMs(start, event.endsAt, durationMs) < fromMs;
}

/** Expand listings into upcoming (or still-visible) occurrences. */
export function expandPlaceEventOccurrences(
  events: PlaceEvent[],
  options?: { from?: Date; horizonDays?: number; limit?: number },
): PlaceEventOccurrence[] {
  const from = options?.from ?? new Date();
  const fromMs = from.getTime();
  const horizonDays = options?.horizonDays ?? 90;
  const limit = options?.limit ?? 24;
  const until = new Date(fromMs + horizonDays * MS_DAY);
  const occurrences: PlaceEventOccurrence[] = [];

  for (const event of events) {
    if (event.isCancelled) continue;
    if (event.kind === "schedule") {
      occurrences.push(...expandScheduleOccurrences(event, from, until));
      continue;
    }
    const one = expandOneTimeOccurrence(event, fromMs, until.getTime());
    if (one) occurrences.push(one);
  }

  return occurrences
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .slice(0, limit);
}

/** Past one-time events only (schedules stay in the regular list). */
export function expandPastPlaceEventOccurrences(
  events: PlaceEvent[],
  options?: { from?: Date; lookbackDays?: number; limit?: number },
): PlaceEventOccurrence[] {
  const from = options?.from ?? new Date();
  const fromMs = from.getTime();
  const lookbackDays = options?.lookbackDays ?? 365;
  const limit = options?.limit ?? 24;
  const earliestMs = fromMs - lookbackDays * MS_DAY;
  const occurrences: PlaceEventOccurrence[] = [];

  for (const event of events) {
    if (event.isCancelled || event.kind !== "event" || !event.startsAt) continue;
    const start = new Date(event.startsAt);
    if (Number.isNaN(start.getTime()) || start.getTime() < earliestMs) continue;
    if (!isPastOneTime(event, fromMs)) continue;
    occurrences.push({
      event,
      startsAt: start.toISOString(),
      endsAt: event.endsAt,
    });
  }

  return occurrences
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .slice(0, limit);
}

/** Occurrences overlapping a calendar month (for month grids). */
export function expandPlaceEventOccurrencesForMonth(
  events: PlaceEvent[],
  year: number,
  month: number,
): PlaceEventOccurrence[] {
  const from = wallTimeToUtc(year, month, 1, 0, 0, "UTC");
  const lastDay = daysInMonth(year, month);
  const until = new Date(Date.UTC(year, month - 1, lastDay, 23, 59, 59));
  // Use a wide horizon from a bit before the month so schedules near boundaries still expand.
  return expandPlaceEventOccurrences(events, {
    from: new Date(from.getTime() - MS_DAY),
    horizonDays: lastDay + 2,
    limit: 200,
  }).filter((occurrence) => {
    const ymd = ymdInZone(new Date(occurrence.startsAt), occurrence.event.timezone);
    return ymd.year === year && ymd.month === month;
  });
}

export function formatScheduleRule(rule: PlaceScheduleRule): string {
  if (rule.freq === "weekly") {
    const days = [...rule.daysOfWeek]
      .sort((a, b) => a - b)
      .map((day) => WEEKDAY_LABELS[day])
      .join(", ");
    return `Weekly · ${days}`;
  }
  return `${MONTH_WEEK_LABELS[rule.week]} ${WEEKDAY_LABELS[rule.weekday]} of the month`;
}

export function formatTimeLabel(time: string): string {
  const parts = parseTimeParts(time);
  if (!parts) return time;
  const period = parts.hour >= 12 ? "PM" : "AM";
  const hour12 = parts.hour % 12 || 12;
  return `${hour12}:${String(parts.minute).padStart(2, "0")} ${period}`;
}

export function formatEventWhen(
  startsAt: string,
  endsAt: string | undefined,
  timezone: string,
  scheduleHint?: string,
): string {
  const start = new Date(startsAt);
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  });

  let label = `${dateFmt.format(start)} · ${timeFmt.format(start)}`;

  if (endsAt) {
    const end = new Date(endsAt);
    const sameDay = dateFmt.format(start) === dateFmt.format(end);
    label += sameDay
      ? ` – ${timeFmt.format(end)}`
      : ` – ${dateFmt.format(end)} ${timeFmt.format(end)}`;
  }

  if (scheduleHint) label += ` · ${scheduleHint}`;
  return label;
}

export function formatListingSummary(event: PlaceEvent): string {
  if (event.kind === "schedule" && event.rule && event.startTime) {
    const time = formatTimeLabel(event.startTime);
    const end = event.endTime ? `–${formatTimeLabel(event.endTime)}` : "";
    return `${formatScheduleRule(event.rule)} · ${time}${end}`;
  }
  if (event.startsAt) {
    return formatEventWhen(event.startsAt, event.endsAt, event.timezone);
  }
  return "No schedule";
}

/** Convert datetime-local form value into an ISO string (best-effort). */
export function localInputToIso(localValue: string): string {
  const trimmed = localValue.trim();
  if (!trimmed) throw new Error("Start date is required");
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid date/time");
  }
  return parsed.toISOString();
}

export function isoToLocalInput(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function isPlaceEventKind(value: string): value is PlaceEventKind {
  return value === "event" || value === "schedule";
}

export function parseScheduleRule(value: unknown): PlaceScheduleRule | undefined {
  if (!value || typeof value !== "object") return undefined;
  const rule = value as Record<string, unknown>;
  if (rule.freq === "weekly" && Array.isArray(rule.daysOfWeek)) {
    const days = rule.daysOfWeek
      .map((day) => Number(day))
      .filter((day): day is PlaceWeekday => Number.isInteger(day) && day >= 0 && day <= 6);
    if (days.length === 0) return undefined;
    return { freq: "weekly", daysOfWeek: [...new Set(days)] as PlaceWeekday[] };
  }
  if (rule.freq === "monthlyNth") {
    const week = Number(rule.week);
    const weekday = Number(rule.weekday);
    if (![1, 2, 3, 4, -1].includes(week)) return undefined;
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) return undefined;
    return {
      freq: "monthlyNth",
      week: week as PlaceMonthWeek,
      weekday: weekday as PlaceWeekday,
    };
  }
  return undefined;
}

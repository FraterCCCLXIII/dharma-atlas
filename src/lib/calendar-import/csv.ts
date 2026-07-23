import { createHash } from "node:crypto";
import type { ImportedCalendarEvent } from "@/lib/calendar-import/types";

const MAX_IMPORTED = 100;

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function parseFlexibleDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (!Number.isNaN(date.getTime())) return date;
  // Support "YYYY-MM-DD HH:mm"
  const spaced = trimmed.replace(" ", "T");
  const retry = new Date(spaced);
  if (!Number.isNaN(retry.getTime())) return retry;
  return null;
}

/**
 * Parse CSV text. Expected headers (case-insensitive):
 * title, starts_at, ends_at?, timezone?, url?, description?
 */
export function parseEventsCsv(
  csvText: string,
  options?: { defaultTimezone?: string },
): ImportedCalendarEvent[] {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV needs a header row and at least one event row.");
  }

  const headers = splitCsvLine(lines[0]!).map(normalizeHeader);
  const titleIdx = headers.findIndex((h) => h === "title" || h === "name" || h === "summary");
  const startIdx = headers.findIndex(
    (h) => h === "starts_at" || h === "start" || h === "start_at" || h === "datetime",
  );
  const endIdx = headers.findIndex((h) => h === "ends_at" || h === "end" || h === "end_at");
  const tzIdx = headers.findIndex((h) => h === "timezone" || h === "tz");
  const urlIdx = headers.findIndex((h) => h === "url" || h === "link");
  const descIdx = headers.findIndex((h) => h === "description" || h === "notes");

  if (titleIdx < 0 || startIdx < 0) {
    throw new Error(
      "CSV must include title and starts_at columns (aliases: name/summary, start/datetime).",
    );
  }

  const defaultTimezone = options?.defaultTimezone ?? "America/Los_Angeles";
  const imported: ImportedCalendarEvent[] = [];

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const cells = splitCsvLine(lines[rowIndex]!);
    const title = (cells[titleIdx] ?? "").trim();
    const startRaw = (cells[startIdx] ?? "").trim();
    if (!title || !startRaw) continue;

    const start = parseFlexibleDate(startRaw);
    if (!start) {
      throw new Error(`Row ${rowIndex + 1}: invalid starts_at “${startRaw}”`);
    }

    const endRaw = endIdx >= 0 ? (cells[endIdx] ?? "").trim() : "";
    const end = endRaw ? parseFlexibleDate(endRaw) : null;
    if (endRaw && !end) {
      throw new Error(`Row ${rowIndex + 1}: invalid ends_at “${endRaw}”`);
    }

    const timezone = (tzIdx >= 0 ? cells[tzIdx]?.trim() : "") || defaultTimezone;
    const url = urlIdx >= 0 ? cells[urlIdx]?.trim() || undefined : undefined;
    const description = descIdx >= 0 ? cells[descIdx]?.trim() || undefined : undefined;
    const hash = createHash("sha1")
      .update([title, start.toISOString(), end?.toISOString() ?? "", timezone].join("|"))
      .digest("hex")
      .slice(0, 16);

    imported.push({
      externalUid: `csv-${hash}`,
      title,
      description,
      startsAt: start.toISOString(),
      endsAt: end?.toISOString(),
      timezone,
      url,
    });

    if (imported.length >= MAX_IMPORTED) break;
  }

  if (imported.length === 0) {
    throw new Error("No valid event rows found in the CSV.");
  }

  return imported.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

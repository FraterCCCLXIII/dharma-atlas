import "server-only";

import { asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { placeEvents } from "@/db/schema";
import type { PlaceEvent, PlaceEventKind } from "@/types/place";
import type { PlaceEventInput } from "@/lib/validations/place-profile";
import {
  isPlaceEventKind,
  localInputToIso,
  parseScheduleRule,
} from "@/lib/place-events";

function rowToPlaceEvent(row: typeof placeEvents.$inferSelect): PlaceEvent {
  const kind: PlaceEventKind = isPlaceEventKind(row.kind) ? row.kind : "event";
  const rule = parseScheduleRule(row.rule);

  // Legacy fallback: old weekly/monthly rows that weren't migrated yet.
  if (kind === "event" && !rule && (row.recurrence === "weekly" || row.recurrence === "monthly")) {
    const startsAt = row.startsAt?.toISOString();
    const start = row.startsAt ? new Date(row.startsAt) : null;
    const dow = start ? start.getUTCDay() : 0;
    const day = start ? start.getUTCDate() : 1;
    const week = Math.min(4, Math.max(1, Math.ceil(day / 7))) as 1 | 2 | 3 | 4;
    return {
      id: row.id,
      placeId: row.placeId,
      kind: "schedule",
      title: row.title,
      description: row.description ?? undefined,
      startTime: startsAt
        ? `${String(start!.getUTCHours()).padStart(2, "0")}:${String(start!.getUTCMinutes()).padStart(2, "0")}`
        : "09:00",
      endTime: row.endsAt
        ? `${String(row.endsAt.getUTCHours()).padStart(2, "0")}:${String(row.endsAt.getUTCMinutes()).padStart(2, "0")}`
        : undefined,
      rule:
        row.recurrence === "weekly"
          ? { freq: "weekly", daysOfWeek: [dow as 0 | 1 | 2 | 3 | 4 | 5 | 6] }
          : { freq: "monthlyNth", week, weekday: dow as 0 | 1 | 2 | 3 | 4 | 5 | 6 },
      timezone: row.timezone,
      url: row.url ?? undefined,
      isCancelled: row.isCancelled,
    };
  }

  const sourceType =
    row.sourceType === "ics" || row.sourceType === "csv" || row.sourceType === "manual"
      ? row.sourceType
      : undefined;

  return {
    id: row.id,
    placeId: row.placeId,
    kind,
    title: row.title,
    description: row.description ?? undefined,
    startsAt: row.startsAt?.toISOString(),
    endsAt: row.endsAt?.toISOString(),
    startTime: row.startTime ?? undefined,
    endTime: row.endTime ?? undefined,
    rule,
    timezone: row.timezone,
    url: row.url ?? undefined,
    externalUid: row.externalUid ?? undefined,
    sourceType,
    isCancelled: row.isCancelled,
  };
}

function parseEventTimestamp(value: string, label: string): Date {
  const iso =
    value.includes("T") && !value.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(value)
      ? localInputToIso(value)
      : value;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${label}`);
  }
  return date;
}

export async function getPlaceEvents(placeId: string): Promise<PlaceEvent[]> {
  const rows = await db
    .select()
    .from(placeEvents)
    .where(eq(placeEvents.placeId, placeId))
    .orderBy(
      sql`case when ${placeEvents.kind} = 'schedule' then 0 else 1 end`,
      asc(placeEvents.startsAt),
      asc(placeEvents.id),
    );

  return rows.map(rowToPlaceEvent);
}

export async function replacePlaceEvents(
  placeId: string,
  input: PlaceEventInput[],
): Promise<PlaceEvent[]> {
  const existing = await db
    .select({ id: placeEvents.id })
    .from(placeEvents)
    .where(eq(placeEvents.placeId, placeId));
  const existingIds = new Set(existing.map((row) => row.id));
  const keepIds = new Set(
    input.map((row) => row.id).filter((id): id is number => typeof id === "number"),
  );

  const toDelete = [...existingIds].filter((id) => !keepIds.has(id));
  if (toDelete.length > 0) {
    await db.delete(placeEvents).where(inArray(placeEvents.id, toDelete));
  }

  const now = new Date();
  for (const event of input) {
    if (event.kind === "schedule") {
      const values = {
        placeId,
        kind: "schedule" as const,
        title: event.title,
        description: event.description,
        startsAt: null,
        endsAt: null,
        startTime: event.startTime,
        endTime: event.endTime,
        rule: event.rule,
        timezone: event.timezone || "America/Los_Angeles",
        url: event.url,
        recurrence: null,
        isCancelled: event.isCancelled,
        updatedAt: now,
      };

      if (event.id && existingIds.has(event.id)) {
        await db.update(placeEvents).set(values).where(eq(placeEvents.id, event.id));
      } else {
        await db.insert(placeEvents).values(values);
      }
      continue;
    }

    const startsAt = parseEventTimestamp(event.startsAt, "start date");
    const endsAt = event.endsAt ? parseEventTimestamp(event.endsAt, "end date") : null;
    if (endsAt && endsAt < startsAt) {
      throw new Error(`“${event.title}” ends before it starts`);
    }

    const values = {
      placeId,
      kind: "event" as const,
      title: event.title,
      description: event.description,
      startsAt,
      endsAt,
      startTime: null,
      endTime: null,
      rule: null,
      timezone: event.timezone || "America/Los_Angeles",
      url: event.url,
      recurrence: null,
      isCancelled: event.isCancelled,
      updatedAt: now,
    };

    if (event.id && existingIds.has(event.id)) {
      await db.update(placeEvents).set(values).where(eq(placeEvents.id, event.id));
    } else {
      await db.insert(placeEvents).values(values);
    }
  }

  return getPlaceEvents(placeId);
}

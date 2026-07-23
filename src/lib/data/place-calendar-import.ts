import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { placeCalendarSources, placeEvents } from "@/db/schema";
import { fetchAndParseIcsUrl } from "@/lib/calendar-import/ics";
import { parseEventsCsv } from "@/lib/calendar-import/csv";
import type { ImportedCalendarEvent } from "@/lib/calendar-import/types";
import { getPlaceEvents } from "@/lib/data/place-events";
import type { PlaceCalendarSource, PlaceEvent } from "@/types/place";

function rowToSource(
  row: typeof placeCalendarSources.$inferSelect,
): PlaceCalendarSource {
  return {
    id: row.id,
    placeId: row.placeId,
    type: "ics",
    url: row.url,
    label: row.label ?? undefined,
    lastSyncedAt: row.lastSyncedAt?.toISOString(),
    lastError: row.lastError ?? undefined,
  };
}

export async function getPlaceIcsSource(
  placeId: string,
): Promise<PlaceCalendarSource | null> {
  const [row] = await db
    .select()
    .from(placeCalendarSources)
    .where(
      and(eq(placeCalendarSources.placeId, placeId), eq(placeCalendarSources.type, "ics")),
    )
    .limit(1);
  return row ? rowToSource(row) : null;
}

async function upsertImportedEvents(
  placeId: string,
  imported: ImportedCalendarEvent[],
  sourceType: "ics" | "csv",
): Promise<{ importedCount: number; updatedCount: number }> {
  const existing = await db
    .select({
      id: placeEvents.id,
      externalUid: placeEvents.externalUid,
    })
    .from(placeEvents)
    .where(eq(placeEvents.placeId, placeId));

  const byUid = new Map(
    existing
      .filter((row) => row.externalUid)
      .map((row) => [row.externalUid as string, row.id]),
  );

  let importedCount = 0;
  let updatedCount = 0;
  const now = new Date();

  for (const event of imported) {
    const values = {
      placeId,
      kind: "event" as const,
      title: event.title.slice(0, 200),
      description: event.description?.slice(0, 2000) ?? null,
      startsAt: new Date(event.startsAt),
      endsAt: event.endsAt ? new Date(event.endsAt) : null,
      startTime: null,
      endTime: null,
      rule: null,
      timezone: event.timezone || "America/Los_Angeles",
      url: event.url ?? null,
      recurrence: null,
      externalUid: event.externalUid,
      sourceType,
      isCancelled: false,
      updatedAt: now,
    };

    const existingId = byUid.get(event.externalUid);
    if (existingId) {
      await db.update(placeEvents).set(values).where(eq(placeEvents.id, existingId));
      updatedCount += 1;
    } else {
      await db.insert(placeEvents).values(values);
      importedCount += 1;
    }
  }

  return { importedCount, updatedCount };
}

export async function connectAndSyncIcsSource(
  placeId: string,
  url: string,
  options?: { label?: string; defaultTimezone?: string },
): Promise<{
  source: PlaceCalendarSource;
  events: PlaceEvent[];
  importedCount: number;
  updatedCount: number;
}> {
  const existing = await getPlaceIcsSource(placeId);
  const now = new Date();

  let sourceId = existing?.id;
  if (existing) {
    await db
      .update(placeCalendarSources)
      .set({
        url: url.trim(),
        label: options?.label ?? existing.label ?? null,
        updatedAt: now,
        lastError: null,
      })
      .where(eq(placeCalendarSources.id, existing.id));
    sourceId = existing.id;
  } else {
    const [created] = await db
      .insert(placeCalendarSources)
      .values({
        placeId,
        type: "ics",
        url: url.trim(),
        label: options?.label ?? "ICS calendar",
      })
      .returning();
    sourceId = created!.id;
  }

  try {
    const imported = await fetchAndParseIcsUrl(url, {
      defaultTimezone: options?.defaultTimezone,
    });
    if (imported.length === 0) {
      throw new Error("No events found in that calendar for the next few months.");
    }
    const counts = await upsertImportedEvents(placeId, imported, "ics");
    await db
      .update(placeCalendarSources)
      .set({
        lastSyncedAt: now,
        lastError: null,
        updatedAt: now,
      })
      .where(eq(placeCalendarSources.id, sourceId!));

    const source = (await getPlaceIcsSource(placeId))!;
    return {
      source,
      events: await getPlaceEvents(placeId),
      ...counts,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Calendar sync failed";
    await db
      .update(placeCalendarSources)
      .set({
        lastError: message,
        updatedAt: now,
      })
      .where(eq(placeCalendarSources.id, sourceId!));
    throw new Error(message);
  }
}

export async function syncExistingIcsSource(placeId: string): Promise<{
  source: PlaceCalendarSource;
  events: PlaceEvent[];
  importedCount: number;
  updatedCount: number;
}> {
  const source = await getPlaceIcsSource(placeId);
  if (!source) {
    throw new Error("No ICS calendar connected yet.");
  }
  return connectAndSyncIcsSource(placeId, source.url, { label: source.label });
}

export async function importEventsFromCsv(
  placeId: string,
  csvText: string,
  options?: { defaultTimezone?: string },
): Promise<{
  events: PlaceEvent[];
  importedCount: number;
  updatedCount: number;
}> {
  const imported = parseEventsCsv(csvText, {
    defaultTimezone: options?.defaultTimezone,
  });
  const counts = await upsertImportedEvents(placeId, imported, "csv");
  return {
    events: await getPlaceEvents(placeId),
    ...counts,
  };
}

export async function disconnectIcsSource(placeId: string): Promise<void> {
  await db
    .delete(placeCalendarSources)
    .where(
      and(eq(placeCalendarSources.placeId, placeId), eq(placeCalendarSources.type, "ics")),
    );
}

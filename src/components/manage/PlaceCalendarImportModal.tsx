"use client";

import { CalendarBlank, FileCsv, Globe, GoogleLogo } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
  connectIcsCalendarAction,
  disconnectIcsCalendarAction,
  getPlaceIcsSourceAction,
  importEventsCsvAction,
  syncIcsCalendarAction,
} from "@/app/manage/actions/place-calendar";
import { fieldClassName, FormField } from "@/components/forms/FormField";
import { Modal } from "@/components/ui/Modal";
import type { PlaceCalendarSource, PlaceEvent } from "@/types/place";

type ImportTab = "ics" | "csv";

interface PlaceCalendarImportModalProps {
  placeId: string;
  open: boolean;
  onClose: () => void;
  onImported: (events: PlaceEvent[]) => void;
}

const CSV_EXAMPLE = `title,starts_at,ends_at,timezone,url,description
Sunday morning sit,2026-08-03T09:00,2026-08-03T10:30,America/Los_Angeles,https://example.com,Open sit
Guest teacher talk,2026-08-10T19:00,,America/Los_Angeles,,`;

export function PlaceCalendarImportModal({
  placeId,
  open,
  onClose,
  onImported,
}: PlaceCalendarImportModalProps) {
  const [tab, setTab] = useState<ImportTab>("ics");
  const [icsUrl, setIcsUrl] = useState("");
  const [csvText, setCsvText] = useState("");
  const [source, setSource] = useState<PlaceCalendarSource | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    setMessage("");
    setTab("ics");
    void getPlaceIcsSourceAction(placeId)
      .then((connected) => {
        setSource(connected);
        if (connected) setIcsUrl(connected.url);
      })
      .catch(() => {
        setSource(null);
      });
  }, [open, placeId]);

  async function handleConnectIcs() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await connectIcsCalendarAction(placeId, icsUrl);
      setSource(result.source);
      onImported(result.events);
      setMessage(
        `Synced ${result.importedCount + result.updatedCount} events (${result.importedCount} new, ${result.updatedCount} updated).`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect calendar");
    } finally {
      setBusy(false);
    }
  }

  async function handleSyncIcs() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await syncIcsCalendarAction(placeId);
      setSource(result.source);
      onImported(result.events);
      setMessage(
        `Synced ${result.importedCount + result.updatedCount} events (${result.importedCount} new, ${result.updatedCount} updated).`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sync calendar");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnectIcs() {
    if (!confirm("Disconnect this ICS feed? Imported events stay on the listing.")) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await disconnectIcsCalendarAction(placeId);
      setSource(null);
      setMessage("ICS feed disconnected.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not disconnect");
    } finally {
      setBusy(false);
    }
  }

  async function handleImportCsv() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const result = await importEventsCsvAction(placeId, csvText);
      onImported(result.events);
      setMessage(
        `Imported ${result.importedCount + result.updatedCount} events (${result.importedCount} new, ${result.updatedCount} updated).`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not import CSV");
    } finally {
      setBusy(false);
    }
  }

  async function handleCsvFile(file: File) {
    const text = await file.text();
    setCsvText(text);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Import / connect calendar"
      description="Bring in events from an ICS feed or CSV. Google and WordPress can use ICS when available."
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex gap-1 rounded-full border border-border bg-surface-muted/50 p-1">
          {(
            [
              ["ics", "ICS feed"],
              ["csv", "CSV file"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTab(value);
                setError("");
                setMessage("");
              }}
              data-active={tab === value}
              className="flex-1 rounded-full px-3 py-1.5 text-sm font-medium text-ink-secondary transition data-[active=true]:bg-surface-elevated data-[active=true]:text-ink data-[active=true]:shadow-sm"
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "ics" ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-3 py-3">
              <CalendarBlank size={22} weight="duotone" className="mt-0.5 text-brand" />
              <div className="min-w-0 text-sm">
                <p className="font-medium text-ink">Connect ICS / iCal URL</p>
                <p className="mt-0.5 text-ink-muted">
                  Works with Google Calendar (secret address), Apple, Outlook, and many WordPress
                  event plugins that publish an ICS feed.
                </p>
              </div>
            </div>

            <FormField id="ics-url" label="Calendar URL">
              <input
                id="ics-url"
                type="url"
                value={icsUrl}
                onChange={(e) => setIcsUrl(e.target.value)}
                className={fieldClassName}
                placeholder="https://calendar.google.com/calendar/ical/…/basic.ics"
              />
            </FormField>

            {source ? (
              <p className="text-xs text-ink-muted">
                Connected
                {source.lastSyncedAt
                  ? ` · last synced ${new Date(source.lastSyncedAt).toLocaleString()}`
                  : null}
                {source.lastError ? ` · last error: ${source.lastError}` : null}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy || !icsUrl.trim()}
                onClick={() => void handleConnectIcs()}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:opacity-50"
              >
                {busy ? "Working…" : source ? "Save & sync" : "Connect & import"}
              </button>
              {source ? (
                <>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleSyncIcs()}
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-ink-secondary transition hover:bg-surface-muted disabled:opacity-50"
                  >
                    Sync now
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleDisconnectIcs()}
                    className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    Disconnect
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-3 py-3">
              <FileCsv size={22} weight="duotone" className="mt-0.5 text-brand" />
              <div className="min-w-0 text-sm">
                <p className="font-medium text-ink">Upload or paste CSV</p>
                <p className="mt-0.5 text-ink-muted">
                  Columns: title, starts_at, optional ends_at, timezone, url, description.
                </p>
              </div>
            </div>

            <input
              type="file"
              accept=".csv,text/csv"
              className="block w-full text-sm text-ink-secondary file:mr-3 file:rounded-full file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleCsvFile(file);
              }}
            />

            <FormField id="csv-text" label="CSV contents">
              <textarea
                id="csv-text"
                rows={8}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                className={`${fieldClassName} resize-y font-mono text-xs`}
                placeholder={CSV_EXAMPLE}
              />
            </FormField>

            <button
              type="button"
              disabled={busy || !csvText.trim()}
              onClick={() => void handleImportCsv()}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover disabled:opacity-50"
            >
              {busy ? "Importing…" : "Import CSV events"}
            </button>
          </div>
        )}

        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Coming soon
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-ink-muted">
              <GoogleLogo size={18} weight="duotone" />
              Google Calendar OAuth
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2.5 text-sm text-ink-muted">
              <Globe size={18} weight="duotone" />
              WordPress REST import
            </div>
          </div>
          <p className="text-xs text-ink-muted">
            Tip: both often expose an ICS URL you can connect above today.
          </p>
        </div>

        {message ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}

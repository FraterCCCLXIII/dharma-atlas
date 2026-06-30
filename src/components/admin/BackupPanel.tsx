"use client";

import { useState, useTransition } from "react";
import type { BackupManifest } from "@/lib/backup";

type CreateBackupResult = {
  id: string;
  archivePath: string | null;
  manifest: BackupManifest;
};

export function BackupPanel({
  initialBackups,
  createBackupAction,
}: {
  initialBackups: BackupManifest[];
  createBackupAction: (archive?: boolean) => Promise<CreateBackupResult>;
}) {
  const [backups, setBackups] = useState(initialBackups);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createBackupAction(true);
        setBackups((current) => [result.manifest, ...current]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Backup failed");
      }
    });
  }

  return (
    <div className="mt-10 space-y-8">
      <div className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold text-ink">Create backup</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Dumps the full database and copies image directories into a timestamped
          folder, then creates a downloadable archive.
        </p>
        <button
          type="button"
          onClick={handleCreate}
          disabled={isPending}
          className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Creating backup…" : "Create backup"}
        </button>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div>
        <h2 className="text-sm font-semibold text-ink">Recent backups</h2>
        {backups.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">No backups yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface-elevated">
            {backups.map((backup) => (
              <li
                key={backup.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-ink">{backup.id}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {new Date(backup.createdAt).toLocaleString()} ·{" "}
                    {backup.counts.placeImages} place images ·{" "}
                    {backup.counts.peopleImages} people images · via{" "}
                    {backup.dumpMethod}
                  </p>
                </div>
                <a
                  href={`/api/admin/backup?id=${encodeURIComponent(backup.id)}&download=1`}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-ink-secondary transition hover:border-brand/30 hover:text-ink"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

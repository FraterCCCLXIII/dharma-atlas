import { createBackupAction, listBackupsAction } from "@/app/admin/actions/backup";
import { BackupPanel } from "@/components/admin/BackupPanel";

export default async function AdminBackupPage() {
  const backups = await listBackupsAction();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold">
        Backups
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        Create a snapshot of the Postgres database plus local images in{" "}
        <code className="text-ink-secondary">public/places/</code> and{" "}
        <code className="text-ink-secondary">public/people/</code>. Backups are
        stored in <code className="text-ink-secondary">backups/</code> on the
        server. You can also run <code className="text-ink-secondary">npm run backup</code>{" "}
        from the CLI.
      </p>

      <BackupPanel initialBackups={backups} createBackupAction={createBackupAction} />
    </div>
  );
}

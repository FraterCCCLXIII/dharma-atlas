export function DraftBadge() {
  return (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
      Draft
    </span>
  );
}

interface DraftStatusFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function DraftStatusField({ checked, onChange }: DraftStatusFieldProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-elevated p-4 transition hover:bg-surface-muted/40">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-border text-brand focus:ring-brand/30"
      />
      <span>
        <span className="block text-sm font-medium text-ink">Save as draft</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
          Draft entries are stored in the database but hidden from explore, search, and public profile pages.
        </span>
      </span>
    </label>
  );
}

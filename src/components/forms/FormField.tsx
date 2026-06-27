import type { ReactNode } from "react";

export const fieldClassName =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-ink-muted focus:border-brand focus:shadow-[0_0_0_3px_rgba(184,137,74,0.15)]";

export const submitButtonClassName =
  "w-full rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover";

export function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-ink-secondary">
        {label}
      </label>
      {children}
    </div>
  );
}

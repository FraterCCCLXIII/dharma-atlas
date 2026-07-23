import { MarkdownText } from "@/components/ui/MarkdownText";

export function PlaceNotice({ notice }: { notice: string }) {
  const text = notice.trim();
  if (!text) return null;

  return (
    <aside
      role="note"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/80">
        Notice
      </p>
      <MarkdownText className="mt-1 text-amber-950 [&_a]:text-amber-950 [&_a]:underline">
        {text}
      </MarkdownText>
    </aside>
  );
}

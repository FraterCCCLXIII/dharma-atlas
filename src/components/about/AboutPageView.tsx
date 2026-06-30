import { FormPageShell } from "@/components/layout/FormPageShell";

export function AboutPageView() {
  return (
    <FormPageShell title="About Dharma Atlas">
      <div className="space-y-5 text-base leading-relaxed text-ink-secondary">
        <p>
          Dharma Atlas is an open directory of meditation centers, monasteries,
          and spiritual guides across traditions — built to help practitioners
          find communities and lineages near them.
        </p>
        <p>
          Listings are curated from public sources and community submissions.
          We aim for accuracy, but details change; if something is missing or
          outdated, please submit an entry or claim a location you represent.
        </p>
        <p className="text-ink">
          Explore by tradition, lineage, and place. No account required.
        </p>
      </div>
    </FormPageShell>
  );
}

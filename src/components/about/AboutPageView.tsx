import Link from "next/link";
import {
  Check,
  Circle,
  Compass,
  Path,
} from "@phosphor-icons/react/dist/ssr";

type RoadmapStatus = "complete" | "in_progress" | "planned";

interface RoadmapItem {
  status: RoadmapStatus;
  title: string;
  detail: string;
}

const ROADMAP: RoadmapItem[] = [
  {
    status: "complete",
    title: "Explore places on map and list",
    detail:
      "Find centers, monasteries, and temples by geography, tradition, and search.",
  },
  {
    status: "complete",
    title: "Place profiles that can grow",
    detail:
      "Photos, about text, offerings, teachers, events, links, and notices.",
  },
  {
    status: "complete",
    title: "People and teacher directory",
    detail: "A second lens for guides and lineages alongside places.",
  },
  {
    status: "complete",
    title: "Tradition pages",
    detail:
      "Context for Buddhist schools and related contemplative paths without collapsing lineages.",
  },
  {
    status: "complete",
    title: "Add, claim, and moderate",
    detail:
      "Community submissions, stewardship claims, and human review so openness stays livable.",
  },
  {
    status: "complete",
    title: "Pilgrimage routes, books, and blog",
    detail:
      "Sacred geography, a books shelf, and notes written in public about how the atlas is built.",
  },
  {
    status: "in_progress",
    title: "Teacher stewardship after claim",
    detail:
      "Closing the loop so claimed teachers get the same care path places already have.",
  },
  {
    status: "in_progress",
    title: "Events discovery and offerings filters",
    detail:
      "Help people find what is happening — and filter by the activities communities actually offer.",
  },
  {
    status: "in_progress",
    title: "Richer calendar tools for place managers",
    detail:
      "Meet schedules where they already live, with imports that managers can trust.",
  },
  {
    status: "planned",
    title: "Denser coverage, city by city",
    detail:
      "Thicker profiles and fewer blank regions through careful catalog work and local contribution.",
  },
  {
    status: "planned",
    title: "Deeper trust signals",
    detail:
      "Clearer freshness, steward presence, and accountability — without turning practice into ratings theater.",
  },
];

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  complete: "Shipped",
  in_progress: "In progress",
  planned: "Next",
};

function RoadmapStatusIcon({ status }: { status: RoadmapStatus }) {
  if (status === "complete") {
    return (
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <Check size={12} weight="bold" aria-hidden />
      </span>
    );
  }

  if (status === "in_progress") {
    return (
      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
        <Path size={12} weight="bold" aria-hidden />
      </span>
    );
  }

  return (
    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
      <Circle size={12} weight="bold" aria-hidden />
    </span>
  );
}

export function AboutPageView() {
  return (
    <div className="bg-surface">
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
            <Compass size={14} weight="bold" />
            Project
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            About Dharma Atlas
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-secondary">
            An open directory of meditation centers, monasteries, temples, and
            spiritual guides — built so practitioners can find communities and
            lineages near them.
          </p>
        </header>

        <div className="mt-10 space-y-12 text-base leading-relaxed text-ink-secondary">
          <section className="space-y-4">
            <p>
              Listings are curated from public sources and community
              submissions. We aim for accuracy, but details change. If something
              is missing or outdated,{" "}
              <Link href="/add" className="font-medium text-brand hover:underline">
                submit an entry
              </Link>{" "}
              or{" "}
              <Link
                href="/claim"
                className="font-medium text-brand hover:underline"
              >
                claim a place
              </Link>{" "}
              you represent. Explore by tradition, lineage, and place — no
              account required.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Manifesto
            </h2>
            <ol className="mt-5 space-y-5">
              <li>
                <p className="font-medium text-ink">
                  A directory serves arrival, not engagement.
                </p>
                <p className="mt-1.5">
                  The job is to shorten the distance between intention and a
                  real door — a zendo, a temple, a retreat, a teacher. We are
                  not building a feed.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">
                  Traditions keep their names.
                </p>
                <p className="mt-1.5">
                  Zen is not Theravāda. Soto is not a generic mindfulness shelf.
                  Related nondual and contemplative paths belong on the map
                  without being collapsed into one essence or one brand.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">
                  Accuracy over polish.
                </p>
                <p className="mt-1.5">
                  Incomplete is honest. Invented coverage is not. We would
                  rather show a thin region than pretend the atlas is finished.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">
                  Contribution with care.
                </p>
                <p className="mt-1.5">
                  Openness on the front, human review on the back. Communities
                  are living institutions; a listing is a pointer we steward,
                  not inventory we own.
                </p>
              </li>
              <li>
                <p className="font-medium text-ink">
                  Practice over marketplace.
                </p>
                <p className="mt-1.5">
                  No ranking traditions by popularity. No “best temple”
                  framing. Promoted listings and booking theater can wait until
                  the index itself is healthier.
                </p>
              </li>
            </ol>
          </section>

          <section className="grid gap-8 sm:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Mission
              </h2>
              <p className="mt-3">
                Help practitioners find places and teachers across traditions —
                with enough lineage context to choose wisely, and enough
                geographic clarity to show up.
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                Vision
              </h2>
              <p className="mt-3">
                A living atlas where serious communities of practice can be
                found accurately, maintained by the people who know them, and
                explored without erasing the paths that make them distinct.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Created by
            </h2>
            <p className="mt-3">
              Dharma Atlas is created by{" "}
              <span className="font-medium text-ink">Paul Bloch</span>, a
              practitioner based in San Diego, California. He has studied across
              various nondual traditions and spent time ordained in the Sōtō Zen
              tradition in Japan at Tōshōji monastery near Okayama.
            </p>
            <p className="mt-3">
              The project grows from that background: respect for lineage,
              curiosity across paths, and a practical wish that people looking
              for a place to sit can find one without noise.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
              Roadmap
            </h2>
            <p className="mt-3">
              Sequencing notes, not promises. Shipped work is already usable;
              what follows is what we are working toward next.
            </p>

            <ul className="mt-6 divide-y divide-border border-t border-border">
              {ROADMAP.map((item) => (
                <li key={item.title} className="flex gap-3 py-4">
                  <RoadmapStatusIcon status={item.status} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p
                        className={`font-medium ${
                          item.status === "complete"
                            ? "text-ink-muted"
                            : "text-ink"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span
                        className={`text-[11px] font-semibold uppercase tracking-wide ${
                          item.status === "complete"
                            ? "text-emerald-700"
                            : item.status === "in_progress"
                              ? "text-brand"
                              : "text-ink-muted"
                        }`}
                      >
                        {STATUS_LABEL[item.status]}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-sm leading-relaxed ${
                        item.status === "complete"
                          ? "text-ink-muted"
                          : "text-ink-secondary"
                      }`}
                    >
                      {item.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm text-ink-muted">
              Want the longer story? Read the{" "}
              <Link
                href="/blog/soft-launch-what-were-shipping-first"
                className="font-medium text-brand hover:underline"
              >
                soft launch notes
              </Link>{" "}
              or browse the{" "}
              <Link href="/blog" className="font-medium text-brand hover:underline">
                blog
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

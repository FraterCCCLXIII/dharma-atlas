import Link from "next/link";
import { CirclesThree } from "@phosphor-icons/react/dist/ssr";
import { traditionProfilePath } from "@/lib/explore-routes";
import { cardLiftClassName } from "@/lib/card-styles";
import type { TraditionHubCard } from "@/lib/data/tradition-articles";
import { getTraditionArticle } from "@/content/traditions";

function TraditionCard({ card }: { card: TraditionHubCard }) {
  return (
    <li>
      <Link
        href={traditionProfilePath(card.slug)}
        className={`group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)] ${cardLiftClassName}`}
      >
        <div className="aspect-[16/10] overflow-hidden bg-surface-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.heroImage}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex flex-1 flex-col px-4 py-4">
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
            {card.label}
          </h3>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-secondary">
            {card.summary}
          </p>
        </div>
      </Link>
    </li>
  );
}

export function TraditionsHomeView({
  buddhistLineages,
  otherTraditions,
}: {
  buddhistLineages: TraditionHubCard[];
  otherTraditions: TraditionHubCard[];
}) {
  const buddhist = getTraditionArticle("buddhist");

  return (
    <div className="pb-16">
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
          <CirclesThree size={14} weight="bold" />
          Encyclopedia
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Traditions
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-secondary">
          Explore Buddhist lineages and related contemplative traditions — with
          practices, texts, teachers, and places linked from Dharma Atlas.
        </p>
      </header>

      {buddhist ? (
        <section className="mt-10">
          <Link
            href={traditionProfilePath("buddhist")}
            className={`group grid overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)] sm:grid-cols-[1.2fr_1fr] ${cardLiftClassName}`}
          >
            <div className="aspect-[16/10] sm:aspect-auto sm:min-h-[220px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={buddhist.heroImage}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex flex-col justify-center px-5 py-6 sm:px-7">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                Buddhism
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary sm:text-base">
                {buddhist.summary}
              </p>
              <span className="mt-4 text-sm font-semibold text-brand">
                Read the overview →
              </span>
            </div>
          </Link>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
          Buddhist lineages
        </h2>
        <p className="mt-1 text-sm text-ink-secondary">
          Major streams and their schools — open any lineage for subschools,
          practices, and local listings.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {buddhistLineages.map((card) => (
            <TraditionCard key={card.slug} card={card} />
          ))}
        </ul>
      </section>

      {otherTraditions.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            Related traditions
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">
            Contemplative and philosophical paths that appear alongside Buddhist
            communities in the directory.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {otherTraditions.map((card) => (
              <TraditionCard key={card.slug} card={card} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

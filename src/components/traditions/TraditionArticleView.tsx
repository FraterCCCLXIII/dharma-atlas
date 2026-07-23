import Link from "next/link";
import { ArrowRight, BookOpen, MapPin, Sparkle, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { PlaceCard } from "@/components/explore/PlaceCard";
import { TeacherCard } from "@/components/explore/TeacherCard";
import { ExploreTraditionLink } from "@/components/traditions/ExploreTraditionLink";
import { MarkdownText } from "@/components/ui/MarkdownText";
import {
  PEOPLE_LIST_PATH,
  PLACES_LIST_PATH,
  TRADITIONS_LIST_PATH,
  traditionProfilePath,
} from "@/lib/explore-routes";
import { cardLiftClassName } from "@/lib/card-styles";
import type { TraditionPageData } from "@/lib/data/tradition-articles";

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: typeof Sparkle;
  title: string;
}) {
  return (
    <h2 className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink">
      <Icon size={20} weight="bold" className="text-ink-muted" />
      {title}
    </h2>
  );
}

export function TraditionArticleView({ data }: { data: TraditionPageData }) {
  const {
    node,
    article,
    ancestors,
    children,
    places,
    teachers,
    exploreFilters,
    placeCount,
    teacherCount,
  } = data;

  return (
    <article className="pb-20">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-[var(--shadow-card)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={article.heroImage}
          alt=""
          className="aspect-[21/9] w-full object-cover sm:aspect-[2.4/1]"
        />
      </div>
      {article.heroImageCredit ? (
        <p className="mt-2 text-right text-[11px] text-ink-muted">
          Photo via{" "}
          <a
            href={article.heroImageCredit.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-2 hover:text-ink-secondary"
          >
            {article.heroImageCredit.name}
          </a>
        </p>
      ) : null}

      <nav aria-label="Breadcrumb" className="mt-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
          <li>
            <Link
              href={TRADITIONS_LIST_PATH}
              className="transition hover:text-ink"
            >
              Traditions
            </Link>
          </li>
          {ancestors.map((ancestor) => (
            <li key={ancestor.slug} className="flex items-center gap-1.5">
              <span aria-hidden>/</span>
              {ancestor.slug === node.slug ? (
                <span className="font-medium text-ink">{ancestor.label}</span>
              ) : (
                <Link
                  href={traditionProfilePath(ancestor.slug)}
                  className="transition hover:text-ink"
                >
                  {ancestor.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="mt-3 max-w-3xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {node.label}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-ink-secondary sm:text-lg">
          {article.summary}
        </p>
      </header>

      <div className="prose-tradition mt-8 max-w-3xl text-base text-ink-secondary">
        <MarkdownText>{article.body}</MarkdownText>
      </div>

      {article.practices.length > 0 ? (
        <section className="mt-12 max-w-3xl">
          <SectionHeading icon={Sparkle} title="Practices" />
          <ul className="mt-4 space-y-3">
            {article.practices.map((practice) => (
              <li
                key={practice.title}
                className="rounded-xl border border-border bg-surface-elevated px-4 py-3"
              >
                <h3 className="text-sm font-semibold text-ink">{practice.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
                  {practice.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {article.texts.length > 0 ? (
        <section className="mt-12 max-w-3xl">
          <SectionHeading icon={BookOpen} title="Texts" />
          <ul className="mt-4 space-y-3">
            {article.texts.map((text) => (
              <li
                key={`${text.title}-${text.author ?? ""}`}
                className="rounded-xl border border-border bg-surface-elevated px-4 py-3"
              >
                {text.href ? (
                  <a
                    href={text.href}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="text-sm font-semibold text-ink underline decoration-border underline-offset-2 hover:decoration-ink"
                  >
                    {text.title}
                  </a>
                ) : (
                  <h3 className="text-sm font-semibold text-ink">{text.title}</h3>
                )}
                {text.author ? (
                  <p className="mt-0.5 text-sm text-ink-secondary">{text.author}</p>
                ) : null}
                {text.note ? (
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {text.note}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {teachers.length > 0 ? (
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionHeading icon={UsersThree} title="Teachers" />
              <p className="mt-1 text-sm text-ink-secondary">
                {teacherCount} in the directory
                {teacherCount > teachers.length
                  ? ` · showing ${teachers.length}`
                  : ""}
              </p>
            </div>
            <ExploreTraditionLink
              href={PEOPLE_LIST_PATH}
              traditions={exploreFilters.traditions}
              schools={exploreFilters.schools}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand transition hover:opacity-80"
            >
              Explore all
              <ArrowRight size={14} weight="bold" />
            </ExploreTraditionLink>
          </div>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {teachers.map((teacher, index) => (
              <li key={teacher.slug}>
                <TeacherCard teacher={teacher} index={index} compact />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {places.length > 0 ? (
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <SectionHeading icon={MapPin} title="Places" />
              <p className="mt-1 text-sm text-ink-secondary">
                {placeCount} in the directory
                {placeCount > places.length ? ` · showing ${places.length}` : ""}
              </p>
            </div>
            <ExploreTraditionLink
              href={PLACES_LIST_PATH}
              traditions={exploreFilters.traditions}
              schools={exploreFilters.schools}
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand transition hover:opacity-80"
            >
              Explore all
              <ArrowRight size={14} weight="bold" />
            </ExploreTraditionLink>
          </div>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {places.map((place, index) => (
              <li key={place.id}>
                <PlaceCard place={place} index={index} animateEntrance={false} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {children.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            Schools & branches
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <li key={child.slug}>
                <Link
                  href={traditionProfilePath(child.slug)}
                  className={`block rounded-xl border border-border bg-surface-elevated px-4 py-3 ${cardLiftClassName}`}
                >
                  <span className="font-semibold text-ink">{child.label}</span>
                  <span className="mt-0.5 block text-sm text-ink-muted">
                    View article →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {article.sources.length > 0 ? (
        <section className="mt-12 max-w-3xl border-t border-border pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Sources & further reading
          </h2>
          <ul className="mt-3 space-y-1.5">
            {article.sources.map((source) => (
              <li key={source.href}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-ink-secondary underline decoration-border underline-offset-2 hover:text-ink hover:decoration-ink"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

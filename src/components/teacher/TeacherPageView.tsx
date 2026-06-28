"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowSquareOut,
  BookOpen,
  CalendarBlank,
  FlowerLotus,
  Globe,
  Sparkle,
  Translate,
  User,
  UsersThree,
} from "@phosphor-icons/react";
import { DetailPageActions } from "@/components/report/ReportEntryModal";
import { teacherTraditionGradient } from "@/lib/teachers";
import {
  formatLifespan,
  isDeceased,
  type Relation,
  type Teacher,
} from "@/types/teacher";
import { DetailNav } from "@/components/layout/SiteHeader";
import { SimilarTeachers } from "@/components/teacher/SimilarTeachers";

interface TeacherPageViewProps {
  teacher: Teacher;
  similar: Teacher[];
  teacherPhotos: Record<string, string>;
}

function formatWebsiteHref(website: string): string {
  if (website.startsWith("http://") || website.startsWith("https://")) {
    return website;
  }
  return `https://${website}`;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

function RelationGroup({
  title,
  people,
  teacherPhotos,
}: {
  title: string;
  people: Relation[];
  teacherPhotos: Record<string, string>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
        {title}
      </h3>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {people.map((person) => {
          const hasProfile = Boolean(person.slug && person.slug in teacherPhotos);
          const photo = person.slug ? teacherPhotos[person.slug] : undefined;

          return (
            <li
              key={`${title}-${person.name}`}
              className="flex items-start gap-3 rounded-xl border border-border bg-surface-elevated p-3"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted">
                {photo ? (
                  <img
                    src={photo}
                    alt={person.name}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User size={22} weight="duotone" className="text-ink-muted" />
                )}
              </div>
              <div className="min-w-0">
                {hasProfile && person.slug ? (
                  <Link
                    href={`/teacher/${person.slug}`}
                    className="font-[family-name:var(--font-fraunces)] text-base font-semibold text-ink transition hover:text-brand"
                  >
                    {person.name}
                  </Link>
                ) : (
                  <p className="font-[family-name:var(--font-fraunces)] text-base font-semibold text-ink">
                    {person.name}
                  </p>
                )}
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand">
                  {person.role}
                </p>
                {person.note && (
                  <p className="mt-1 text-sm leading-snug text-ink-secondary">
                    {person.note}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function TeacherPageView({
  teacher,
  similar,
  teacherPhotos,
}: TeacherPageViewProps) {
  const gradient = teacherTraditionGradient(teacher.tradition);
  const deceased = isDeceased(teacher);
  const lifespan = formatLifespan(teacher);
  const heroImage = teacher.heroPhoto ?? teacher.photo;
  const hasRelations =
    teacher.relations &&
    ((teacher.relations.teachers?.length ?? 0) > 0 ||
      (teacher.relations.peers?.length ?? 0) > 0 ||
      (teacher.relations.students?.length ?? 0) > 0);

  return (
    <div className="min-h-dvh bg-surface">
      <DetailNav />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
          aria-label="Back to directory"
        >
          <ArrowLeft size={18} weight="bold" />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                {teacher.lineage}
              </span>
              <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-secondary">
                {teacher.tradition}
              </span>
              <span className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-ink-secondary">
                {deceased ? "Historical figure" : "Living teacher"}
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {teacher.name}
              </h1>
              <p className="text-sm text-ink-secondary">
                {lifespan
                  ? `${lifespan} · ${teacher.location}`
                  : teacher.location}
              </p>
            </div>
          </div>

          <DetailPageActions
            shareTitle={teacher.name}
            shareText={teacher.shortBio}
            entityType="teacher"
            entityId={teacher.slug}
            entityName={teacher.name}
            entityPath={`/teacher/${teacher.slug}`}
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="order-2 space-y-10 lg:order-1">
            <section className="space-y-4 border-b border-border pb-10">
              <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink">
                About this teacher
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-ink-secondary">
                {teacher.shortBio}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm">
                  <FlowerLotus
                    size={20}
                    weight="duotone"
                    className="text-brand"
                  />
                  <span className="text-ink-secondary">
                    {teacher.tradition} tradition
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm">
                  <Sparkle size={20} weight="duotone" className="text-accent" />
                  <span className="text-ink-secondary">{teacher.lineage}</span>
                </div>
                {teacher.languages.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm">
                    <Translate
                      size={20}
                      weight="duotone"
                      className="text-brand"
                    />
                    <span className="text-ink-secondary">
                      {teacher.languages.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </section>

            {teacher.biography.length > 0 && (
              <section className="space-y-4 border-b border-border pb-10">
                <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink">
                  Biography
                </h2>
                <div className="max-w-2xl space-y-4">
                  {teacher.biography.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 48)}
                      className="text-base leading-relaxed text-ink-secondary"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {teacher.topics.length > 0 && (
              <section className="space-y-4 border-b border-border pb-10">
                <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink">
                  Teachings & topics
                </h2>
                <div className="flex flex-wrap gap-2">
                  {teacher.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-ink-secondary"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {hasRelations && teacher.relations && (
              <section className="space-y-6 border-b border-border pb-10">
                <div className="flex items-center gap-2">
                  <UsersThree size={22} weight="duotone" className="text-brand" />
                  <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink">
                    Lineage & relations
                  </h2>
                </div>
                <div className="space-y-8">
                  {teacher.relations.teachers &&
                    teacher.relations.teachers.length > 0 && (
                      <RelationGroup
                        title="Teachers"
                        people={teacher.relations.teachers}
                        teacherPhotos={teacherPhotos}
                      />
                    )}
                  {teacher.relations.peers &&
                    teacher.relations.peers.length > 0 && (
                      <RelationGroup
                        title="Peers & co-teachers"
                        people={teacher.relations.peers}
                        teacherPhotos={teacherPhotos}
                      />
                    )}
                  {teacher.relations.students &&
                    teacher.relations.students.length > 0 && (
                      <RelationGroup
                        title="Notable students"
                        people={teacher.relations.students}
                        teacherPhotos={teacherPhotos}
                      />
                    )}
                </div>
              </section>
            )}

            {teacher.bibliography.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen size={22} weight="duotone" className="text-brand" />
                  <h2 className="font-[family-name:var(--font-fraunces)] text-xl font-semibold text-ink">
                    Bibliography
                  </h2>
                </div>
                <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-elevated">
                  {teacher.bibliography.map((book) => (
                    <li
                      key={`${book.title}-${book.year}`}
                      className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between"
                    >
                      {book.url ? (
                        <a
                          href={book.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink transition hover:text-brand"
                        >
                          {book.title}
                        </a>
                      ) : (
                        <span className="font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink">
                          {book.title}
                        </span>
                      )}
                      <span className="text-sm text-ink-muted">
                        {book.year} · {book.publisher}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="order-1 space-y-5 lg:order-2 lg:sticky lg:top-24 lg:self-start">
            <div className="mx-auto w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-surface-muted shadow-[var(--shadow-card)] lg:mx-0 lg:max-w-none">
              <div className="aspect-[4/5]">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={`Portrait of ${teacher.name}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
                  >
                    <User size={64} weight="duotone" className="text-white/40" />
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-[var(--shadow-card)]">
              <div className="space-y-5 p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    Profile
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-fraunces)] text-lg font-semibold text-ink">
                    Teacher details
                  </p>
                </div>

                <dl className="space-y-3 text-sm">
                  <DetailRow label="Lineage" value={teacher.lineage} />
                  <DetailRow label="Tradition" value={teacher.tradition} />
                  {deceased && lifespan ? (
                    <DetailRow label="Lifespan" value={lifespan} />
                  ) : (
                    <>
                      <DetailRow label="Location" value={teacher.location} />
                      {teacher.base && (
                        <DetailRow label="Based at" value={teacher.base} />
                      )}
                      <DetailRow
                        label="Years teaching"
                        value={`${teacher.yearsTeaching} years`}
                      />
                    </>
                  )}
                  {teacher.languages.length > 0 && (
                    <DetailRow
                      label="Languages"
                      value={teacher.languages.join(", ")}
                    />
                  )}
                </dl>

                {!deceased && teacher.retreats.length > 0 && (
                  <div className="space-y-3 border-t border-border pt-5">
                    <div className="flex items-center gap-2">
                      <CalendarBlank
                        size={18}
                        weight="duotone"
                        className="text-brand"
                      />
                      <p className="text-sm font-semibold text-ink">
                        Upcoming retreats
                      </p>
                    </div>
                    <div className="space-y-3">
                      {teacher.retreats.map((retreat) => (
                        <div
                          key={`${retreat.title}-${retreat.dates}`}
                          className="rounded-xl border border-border bg-surface px-4 py-3"
                        >
                          <p className="font-medium text-ink">{retreat.title}</p>
                          <p className="mt-1 text-xs text-ink-muted">
                            {retreat.dates} · {retreat.location}
                          </p>
                          {retreat.price && (
                            <p className="mt-1 text-xs font-medium text-brand">
                              {retreat.price}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(teacher.website || teacher.socials.length > 0) && (
                  <div className="space-y-2 border-t border-border pt-5">
                    {teacher.website && (
                      <a
                        href={formatWebsiteHref(teacher.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand-hover"
                      >
                        <Globe size={18} weight="bold" />
                        Visit website
                      </a>
                    )}
                    {teacher.socials.map((social) => (
                      <a
                        key={social.label}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-ink transition hover:bg-surface-muted"
                      >
                        <ArrowSquareOut size={18} weight="bold" />
                        {social.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <SimilarTeachers teachers={similar} />
          </section>
        )}
      </main>
    </div>
  );
}

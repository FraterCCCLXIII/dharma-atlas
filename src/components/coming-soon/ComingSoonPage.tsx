"use client";

import { useMemo, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkle } from "@phosphor-icons/react";
import { AMAZON_BOOKS } from "@/data/amazon-books";
import { bookCoverUrl } from "@/lib/amazon";

export type ComingSoonVariant = "books" | "lineages";

const VARIANT: Record<
  ComingSoonVariant,
  {
    title: string;
    kicker: string;
    description: string;
    highlights: string[];
  }
> = {
  books: {
    title: "Books",
    kicker: "A living library",
    description:
      "Foundational texts, modern guides, and publishers across Buddhist, Hindu, and contemplative paths — soon searchable beside the places and people already on the map.",
    highlights: [
      "Curated covers & topics",
      "Publisher browsing",
      "Linked from teachers & places",
    ],
  },
  lineages: {
    title: "Lineages",
    kicker: "Paths with depth",
    description:
      "Trace schools, teachers, and practices from root traditions to living communities — a guide that connects ontology to the centers you can visit.",
    highlights: [
      "School & subschool maps",
      "Practice overviews",
      "Tied to real places",
    ],
  },
};

/** Mixed Buddhist lineage faces for the lineages teaser. */
const LINEAGE_FACES: { name: string; photo: string; lineage: string }[] = [
  {
    name: "Ajahn Chah",
    photo: "/people/ajahn-chah.png",
    lineage: "Thai Forest",
  },
  {
    name: "Shunryu Suzuki",
    photo: "/people/shunryu-suzuki.png",
    lineage: "Sōtō Zen",
  },
  {
    name: "Thich Nhat Hanh",
    photo: "/people/thich-nhat-hanh.jpg",
    lineage: "Vietnamese Thiền",
  },
  {
    name: "Pema Chödrön",
    photo: "/people/pema-chodron.jpg",
    lineage: "Shambhala",
  },
  {
    name: "Chögyam Trungpa",
    photo: "/people/chogyam-trungpa.png",
    lineage: "Kagyu",
  },
  {
    name: "Hakuin Ekaku",
    photo: "/people/hakuin-ekaku.png",
    lineage: "Rinzai Zen",
  },
  {
    name: "Padmasambhava",
    photo: "/people/padmasambhava.jpg",
    lineage: "Nyingma",
  },
  {
    name: "Milarepa",
    photo: "/people/milarepa.jpg",
    lineage: "Kagyu",
  },
  {
    name: "Tenzin Gyatso",
    photo: "/people/tenzin-gyatso.jpg",
    lineage: "Gelug",
  },
  {
    name: "Taizan Maezumi",
    photo: "/people/taizan-maezumi.png",
    lineage: "White Plum",
  },
  {
    name: "Seung Sahn",
    photo: "/people/seung-sahn.jpg",
    lineage: "Korean Seon",
  },
  {
    name: "Jack Kornfield",
    photo: "/people/jack-kornfield.jpg",
    lineage: "Insight",
  },
  {
    name: "Sharon Salzberg",
    photo: "/people/sharon-salzberg.jpg",
    lineage: "Theravāda",
  },
  {
    name: "Dilgo Khyentse",
    photo: "/people/dilgo-khyentse.jpg",
    lineage: "Nyingma",
  },
  {
    name: "Joseph Goldstein",
    photo: "/people/joseph-goldstein.jpg",
    lineage: "Vipassana",
  },
  {
    name: "Yongey Mingyur Rinpoche",
    photo: "/people/yongey-mingyur-rinpoche.png",
    lineage: "Kagyu",
  },
  {
    name: "Ajahn Brahm",
    photo: "/people/ajahn-brahm.png",
    lineage: "Thai Forest",
  },
  {
    name: "Thubten Chodron",
    photo: "/people/thubten-chodron.jpg",
    lineage: "Gelug",
  },
];

export function ComingSoonPage({ variant }: { variant: ComingSoonVariant }) {
  const reduceMotion = useReducedMotion();
  const copy = VARIANT[variant];

  const bookCovers = useMemo(
    () =>
      AMAZON_BOOKS.slice(0, 24).map((book) => ({
        key: book.asin,
        src: bookCoverUrl(book),
        title: book.title,
      })),
    [],
  );

  return (
    <div className="relative isolate min-h-[calc(100dvh-var(--site-header-height,4.5rem))] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-surface"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-1/4 top-0 h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle_at_center,rgba(209,127,40,0.22),transparent_68%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-1/5 bottom-0 h-[65%] w-[60%] rounded-full bg-[radial-gradient(circle_at_center,rgba(58,52,43,0.12),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%, black, transparent)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pt-20">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-accent-soft/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-brand shadow-[var(--shadow-card)] backdrop-blur-sm">
            <Sparkle size={12} weight="fill" />
            Coming soon
          </span>
          <span className="text-xs font-medium text-ink-muted">
            {copy.kicker}
          </span>
        </motion.div>

        <div className="mt-8 grid items-center gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <motion.h1
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.65,
                delay: reduceMotion ? 0 : 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-display text-5xl font-semibold tracking-tight text-ink sm:text-6xl lg:text-7xl"
            >
              {copy.title}
            </motion.h1>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: reduceMotion ? 0 : 0.16,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-5 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg"
            >
              {copy.description}
            </motion.p>
          </div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.7,
              delay: reduceMotion ? 0 : 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative mx-auto w-full max-w-sm lg:mx-0 lg:justify-self-end"
          >
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border/80 bg-surface-elevated/80 shadow-[var(--shadow-float)]">
              <div
                aria-hidden
                className={`absolute inset-0 bg-gradient-to-br ${
                  variant === "books"
                    ? "from-amber-900/20 via-transparent to-stone-900/15"
                    : "from-teal-900/15 via-transparent to-amber-900/12"
                }`}
              />
              {variant === "books" ? (
                <BookCoverCarousel
                  covers={bookCovers}
                  reduceMotion={Boolean(reduceMotion)}
                />
              ) : (
                <LineageFaceCarousel reduceMotion={Boolean(reduceMotion)} />
              )}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-surface-elevated via-surface-elevated/70 to-transparent"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface-elevated via-surface-elevated/70 to-transparent"
              />
            </div>
          </motion.div>
        </div>

        <motion.ul
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            delay: reduceMotion ? 0 : 0.28,
          }}
          className="mt-14 grid gap-3 sm:grid-cols-3"
        >
          {copy.highlights.map((item, index) => (
            <li
              key={item}
              className="rounded-2xl border border-border/80 bg-surface-elevated/60 px-4 py-4 text-sm font-medium text-ink-secondary shadow-[var(--shadow-card)] backdrop-blur-sm"
            >
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
                0{index + 1}
              </span>
              {item}
            </li>
          ))}
        </motion.ul>
      </div>
    </div>
  );
}

function BookCoverCarousel({
  covers,
  reduceMotion,
}: {
  covers: { key: string; src: string; title: string }[];
  reduceMotion: boolean;
}) {
  const colA = covers.filter((_, i) => i % 2 === 0);
  const colB = covers.filter((_, i) => i % 2 === 1);

  return (
    <div
      className="absolute inset-0 flex gap-3 px-4 py-3"
      aria-hidden
    >
      <MarqueeColumn
        duration={38}
        reverse={false}
        reduceMotion={reduceMotion}
        className="flex-1"
      >
        {[...colA, ...colA].map((cover, index) => (
          <BookCoverTile
            key={`${cover.key}-a-${index}`}
            src={cover.src}
            title={cover.title}
          />
        ))}
      </MarqueeColumn>
      <MarqueeColumn
        duration={46}
        reverse
        reduceMotion={reduceMotion}
        className="flex-1"
      >
        {[...colB, ...colB].map((cover, index) => (
          <BookCoverTile
            key={`${cover.key}-b-${index}`}
            src={cover.src}
            title={cover.title}
          />
        ))}
      </MarqueeColumn>
    </div>
  );
}

function BookCoverTile({ src, title }: { src: string; title: string }) {
  return (
    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-border/60 bg-surface-muted shadow-[var(--shadow-card)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        title={title}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function LineageFaceCarousel({ reduceMotion }: { reduceMotion: boolean }) {
  const colA = LINEAGE_FACES.filter((_, i) => i % 2 === 0);
  const colB = LINEAGE_FACES.filter((_, i) => i % 2 === 1);

  return (
    <div className="absolute inset-0 flex gap-3 px-4 py-3" aria-hidden>
      <MarqueeColumn
        duration={36}
        reverse={false}
        reduceMotion={reduceMotion}
        className="flex-1"
      >
        {[...colA, ...colA].map((face, index) => (
          <FaceTile
            key={`${face.photo}-a-${index}`}
            name={face.name}
            photo={face.photo}
            lineage={face.lineage}
          />
        ))}
      </MarqueeColumn>
      <MarqueeColumn
        duration={44}
        reverse
        reduceMotion={reduceMotion}
        className="flex-1"
      >
        {[...colB, ...colB].map((face, index) => (
          <FaceTile
            key={`${face.photo}-b-${index}`}
            name={face.name}
            photo={face.photo}
            lineage={face.lineage}
          />
        ))}
      </MarqueeColumn>
    </div>
  );
}

function FaceTile({
  name,
  photo,
  lineage,
}: {
  name: string;
  photo: string;
  lineage: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border/70 bg-surface-elevated/85 px-2 py-3 shadow-[var(--shadow-card)] backdrop-blur-sm">
      <span className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-border-strong/40 bg-surface-muted shadow-inner sm:h-24 sm:w-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo}
          alt=""
          title={name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top"
        />
      </span>
      <span className="w-full px-1 text-center">
        <span className="block truncate text-[11px] font-semibold text-ink">
          {name}
        </span>
        <span className="mt-0.5 block truncate text-[10px] font-medium text-ink-muted">
          {lineage}
        </span>
      </span>
    </div>
  );
}

function MarqueeColumn({
  children,
  duration,
  reverse,
  reduceMotion,
  className,
}: {
  children: ReactNode;
  duration: number;
  reverse?: boolean;
  reduceMotion: boolean;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex flex-col gap-3 will-change-transform"
        animate={
          reduceMotion
            ? undefined
            : reverse
              ? { y: ["-50%", "0%"] }
              : { y: ["0%", "-50%"] }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration,
                repeat: Infinity,
                ease: "linear",
              }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}

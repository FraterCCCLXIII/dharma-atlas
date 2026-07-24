import Link from "next/link";
import { Notebook } from "@phosphor-icons/react/dist/ssr";
import type { BlogPost } from "@/content/blog/types";
import { BLOG_TAG_LABELS } from "@/lib/blog-tags";

function formatPublishedDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function BlogHomeView({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="bg-surface">
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
            <Notebook size={14} weight="bold" />
            Journal
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Blog
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink-secondary">
            Notes on building Dharma Atlas in the open — product updates,
            catalog craft, and practical guides for places, people, and paths of
            practice.
          </p>
        </header>

        <ul className="mt-10 divide-y divide-border border-t border-border">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block py-6 transition hover:bg-surface-muted/60"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
                  <time dateTime={post.publishedAt}>
                    {formatPublishedDate(post.publishedAt)}
                  </time>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[12px] font-medium uppercase tracking-wide text-ink-muted"
                    >
                      {BLOG_TAG_LABELS[tag]}
                    </span>
                  ))}
                </div>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight text-ink transition group-hover:text-ink">
                  {post.title}
                </h2>
                <p className="mt-2 text-base leading-relaxed text-ink-secondary">
                  {post.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

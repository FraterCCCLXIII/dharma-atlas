import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { BlogPost } from "@/content/blog/types";
import { MarkdownText } from "@/components/ui/MarkdownText";
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

export function BlogArticleView({
  post,
  related,
}: {
  post: BlogPost;
  related: BlogPost[];
}) {
  return (
    <div className="bg-surface">
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
        >
          <ArrowLeft size={18} weight="bold" />
          Back to blog
        </Link>

        <article>
          <header>
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
            <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-secondary">
              {post.summary}
            </p>
          </header>

          <MarkdownText className="mt-8 text-base text-ink-secondary">
            {post.body}
          </MarkdownText>
        </article>

        {related.length > 0 ? (
          <aside className="mt-14 border-t border-border pt-10">
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              More from the blog
            </h2>
            <ul className="mt-4 space-y-4">
              {related.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/blog/${item.slug}`}
                    className="group block"
                  >
                    <p className="text-sm text-ink-muted">
                      {formatPublishedDate(item.publishedAt)}
                    </p>
                    <p className="mt-0.5 font-medium text-ink transition group-hover:underline">
                      {item.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
      </main>
    </div>
  );
}

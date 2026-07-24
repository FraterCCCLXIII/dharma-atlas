import ReactMarkdown from "react-markdown";

interface MarkdownTextProps {
  children: string;
  className?: string;
}

function isSafeHref(href: string): boolean {
  if (/^https?:\/\//i.test(href)) return true;
  // Same-origin app paths for in-content CTAs (blog, traditions, etc.).
  if (href.startsWith("/") && !href.startsWith("//")) return true;
  return false;
}

/** Safe markdown subset for place descriptions and blog posts (no raw HTML). */
export function MarkdownText({ children, className }: MarkdownTextProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        skipHtml
        allowedElements={[
          "p",
          "strong",
          "em",
          "a",
          "ul",
          "ol",
          "li",
          "h2",
          "h3",
          "h4",
          "blockquote",
          "br",
        ]}
        unwrapDisallowed
        components={{
          a: ({ href, children: linkChildren }) => {
            if (typeof href !== "string" || !isSafeHref(href)) {
              return <>{linkChildren}</>;
            }
            const external = /^https?:\/\//i.test(href);
            return (
              <a
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="font-medium text-ink underline decoration-border underline-offset-2 transition hover:decoration-ink-muted"
              >
                {linkChildren}
              </a>
            );
          },
          p: ({ children: pChildren }) => (
            <p className="mb-3 last:mb-0 leading-relaxed">{pChildren}</p>
          ),
          ul: ({ children: listChildren }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{listChildren}</ul>
          ),
          ol: ({ children: listChildren }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{listChildren}</ol>
          ),
          blockquote: ({ children: quoteChildren }) => (
            <blockquote className="mb-3 border-l-2 border-border pl-4 text-ink-secondary italic last:mb-0">
              {quoteChildren}
            </blockquote>
          ),
          h2: ({ children: headingChildren }) => (
            <h3 className="mb-2 mt-6 font-display text-lg font-semibold text-ink first:mt-0">
              {headingChildren}
            </h3>
          ),
          h3: ({ children: headingChildren }) => (
            <h4 className="mb-2 mt-4 font-semibold text-ink first:mt-0">
              {headingChildren}
            </h4>
          ),
          h4: ({ children: headingChildren }) => (
            <h5 className="mb-2 mt-3 text-sm font-semibold text-ink first:mt-0">
              {headingChildren}
            </h5>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

import ReactMarkdown from "react-markdown";

interface MarkdownTextProps {
  children: string;
  className?: string;
}

/** Safe markdown subset for place descriptions (no raw HTML). */
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
          "br",
        ]}
        unwrapDisallowed
        components={{
          a: ({ href, children: linkChildren }) => {
            const safe =
              typeof href === "string" && /^https?:\/\//i.test(href) ? href : undefined;
            if (!safe) return <>{linkChildren}</>;
            return (
              <a href={safe} target="_blank" rel="noopener noreferrer">
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
          h2: ({ children: headingChildren }) => (
            <h3 className="mb-2 mt-4 font-display text-lg font-semibold text-ink first:mt-0">
              {headingChildren}
            </h3>
          ),
          h3: ({ children: headingChildren }) => (
            <h4 className="mb-2 mt-3 font-semibold text-ink first:mt-0">{headingChildren}</h4>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

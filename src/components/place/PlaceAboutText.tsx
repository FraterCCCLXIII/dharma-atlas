"use client";

import { useEffect, useRef, useState } from "react";
import { MarkdownText } from "@/components/ui/MarkdownText";

const COLLAPSED_MAX_HEIGHT_PX = 160;

export function PlaceAboutText({ text }: { text: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;

    function measure() {
      if (!contentRef.current) return;
      setCanExpand(contentRef.current.scrollHeight > COLLAPSED_MAX_HEIGHT_PX + 4);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div className="max-w-2xl">
      <div className="relative">
        <div
          ref={contentRef}
          className="overflow-hidden transition-[max-height] duration-300 ease-out"
          style={{
            maxHeight: expanded || !canExpand ? undefined : COLLAPSED_MAX_HEIGHT_PX,
          }}
        >
          <MarkdownText className="text-base text-ink-secondary">{text}</MarkdownText>
        </div>
        {canExpand && !expanded ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-surface to-transparent"
          />
        ) : null}
      </div>
      {canExpand ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-2 text-sm font-semibold text-brand transition hover:text-brand-hover"
          aria-expanded={expanded}
        >
          {expanded ? "View less" : "View more"}
        </button>
      ) : null}
    </div>
  );
}

import { marked } from "marked";
import TurndownService from "turndown";

marked.setOptions({
  gfm: true,
  breaks: false,
});

const turndown = new TurndownService({
  headingStyle: "atx",
  bulletListMarker: "-",
  codeBlockStyle: "fenced",
  emDelimiter: "*",
  strongDelimiter: "**",
  linkStyle: "inlined",
});

turndown.addRule("stripDisallowed", {
  filter: ["img", "script", "style", "iframe"],
  replacement: () => "",
});

/** Convert stored markdown into HTML for the rich-text editor. */
export function markdownToHtml(markdown: string): string {
  const trimmed = markdown.trim();
  if (!trimmed) return "";
  const html = marked.parse(trimmed, { async: false });
  return typeof html === "string" ? html : "";
}

/** Convert editor HTML back to markdown for storage. */
export function htmlToMarkdown(html: string): string {
  const trimmed = html.trim();
  if (!trimmed || trimmed === "<p></p>") return "";
  return turndown.turndown(trimmed).trim();
}

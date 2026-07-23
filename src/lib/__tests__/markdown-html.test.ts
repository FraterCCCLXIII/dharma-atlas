import { describe, expect, it } from "vitest";
import { htmlToMarkdown, markdownToHtml } from "@/lib/markdown-html";

describe("markdown-html", () => {
  it("round-trips basic formatting", () => {
    const markdown = "## Welcome\n\nThis is **bold** and *italic*.\n\n- one\n- two";
    const html = markdownToHtml(markdown);
    expect(html).toContain("<h2>");
    expect(html).toContain("<strong>");
    const back = htmlToMarkdown(html);
    expect(back).toContain("## Welcome");
    expect(back).toContain("**bold**");
    expect(back).toContain("*italic*");
  });

  it("handles empty content", () => {
    expect(markdownToHtml("")).toBe("");
    expect(htmlToMarkdown("<p></p>")).toBe("");
  });
});

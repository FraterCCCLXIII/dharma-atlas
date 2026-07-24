/** First sentence or first line of a longer description for list previews. */
export function firstDescriptionLine(text: string | null | undefined): string {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "";

  const firstLine = trimmed.split(/\n+/)[0]?.trim() ?? "";
  const sentence = firstLine.match(/^(.+?[.!?])(\s|$)/);
  return (sentence?.[1] ?? firstLine).trim();
}

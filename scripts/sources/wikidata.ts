import { fetchJson } from "./http";

const WP_API = "https://en.wikipedia.org/w/api.php";

interface PagePropsResponse {
  query?: { pages?: Record<string, { pageprops?: { wikibase_item?: string } }> };
}

export async function qidFromTitle(title: string): Promise<string | null> {
  const url = `${WP_API}?action=query&prop=pageprops&ppprop=wikibase_item&redirects=1&format=json&titles=${encodeURIComponent(title)}`;
  const data = await fetchJson<PagePropsResponse>(url);
  const pages = data?.query?.pages;
  if (!pages) return null;
  for (const page of Object.values(pages)) {
    if (page.pageprops?.wikibase_item) return page.pageprops.wikibase_item;
  }
  return null;
}

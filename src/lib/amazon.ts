import type { AmazonBook } from "@/data/amazon-books";

/** Optional Amazon Associates tag for referral links. */
export function amazonAssociateTag(): string | undefined {
  const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim();
  return tag || undefined;
}

export function amazonProductUrl(asin: string, tag = amazonAssociateTag()): string {
  const url = new URL(`https://www.amazon.com/dp/${asin}`);
  if (tag) url.searchParams.set("tag", tag);
  return url.toString();
}

/** Accurate cover art from Open Library (matched to title). */
export function bookCoverUrl(book: AmazonBook): string {
  return `https://covers.openlibrary.org/b/id/${book.openLibraryCoverId}-L.jpg`;
}

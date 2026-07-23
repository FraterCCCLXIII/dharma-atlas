import { buddhistArticle } from "./articles/buddhist";
import { otherTraditionArticles } from "./articles/other";
import { pureLandWonMahayanaArticles } from "./articles/pure-land-won-mahayana";
import { southeastAsianArticles } from "./articles/southeast-asian";
import { theravadaArticles } from "./articles/theravada";
import { tibetanArticles } from "./articles/tibetan";
import { zenArticles } from "./articles/zen";
import type { TraditionArticle } from "./types";

export type { TraditionArticle, TraditionPractice, TraditionText, TraditionSource } from "./types";

export const TRADITION_ARTICLES: TraditionArticle[] = [
  buddhistArticle,
  ...tibetanArticles,
  ...zenArticles,
  ...theravadaArticles,
  ...southeastAsianArticles,
  ...pureLandWonMahayanaArticles,
  ...otherTraditionArticles,
];

const articlesBySlug = new Map(
  TRADITION_ARTICLES.map((article) => [article.slug, article]),
);

export function getTraditionArticle(slug: string): TraditionArticle | undefined {
  return articlesBySlug.get(slug);
}

export function getAllTraditionArticleSlugs(): string[] {
  return TRADITION_ARTICLES.map((article) => article.slug);
}

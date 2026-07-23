export type TraditionPractice = {
  title: string;
  description: string;
};

export type TraditionText = {
  title: string;
  author?: string;
  note?: string;
  /** External or Amazon product URL */
  href?: string;
};

export type TraditionSource = {
  label: string;
  href: string;
};

export type TraditionHeroCredit = {
  name: string;
  url: string;
};

export type TraditionArticle = {
  slug: string;
  heroImage: string;
  heroImageCredit?: TraditionHeroCredit;
  summary: string;
  body: string;
  practices: TraditionPractice[];
  texts: TraditionText[];
  sources: TraditionSource[];
};

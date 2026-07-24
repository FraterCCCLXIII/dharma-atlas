import { accountsClaimsPost } from "./articles/accounts-claims";
import { catalogChallengesPost } from "./articles/catalog-challenges";
import { exploreLocalPost } from "./articles/explore-local";
import { findingCentersNearYouPost } from "./articles/finding-centers-near-you";
import { howToAddPlacePost } from "./articles/how-to-add-place";
import { howToClaimPost } from "./articles/how-to-claim";
import { inclusiveByDesignPost } from "./articles/inclusive-by-design";
import { launchingDirectoryPost } from "./articles/launching-directory";
import { pilgrimagePlanningPost } from "./articles/pilgrimage-planning";
import { placeProfilesPost } from "./articles/place-profiles";
import { planningPilgrimagePost } from "./articles/planning-pilgrimage";
import { softLaunchPost } from "./articles/soft-launch";
import { suggestingCorrectionsPost } from "./articles/suggesting-corrections";
import { traditionsBooksPost } from "./articles/traditions-books";
import { welcomePost } from "./articles/welcome";
import type { BlogPost } from "./types";

export type { BlogPost, BlogTag } from "./types";

export const BLOG_POSTS: BlogPost[] = [
  welcomePost,
  launchingDirectoryPost,
  accountsClaimsPost,
  softLaunchPost,
  exploreLocalPost,
  placeProfilesPost,
  traditionsBooksPost,
  pilgrimagePlanningPost,
  catalogChallengesPost,
  inclusiveByDesignPost,
  howToAddPlacePost,
  howToClaimPost,
  suggestingCorrectionsPost,
  findingCentersNearYouPost,
  planningPilgrimagePost,
];

const postsBySlug = new Map(BLOG_POSTS.map((post) => [post.slug, post]));

export function getBlogPost(slug: string): BlogPost | undefined {
  return postsBySlug.get(slug);
}

export function getAllBlogPostSlugs(): string[] {
  return BLOG_POSTS.map((post) => post.slug);
}

/** Newest first. */
export function getAllBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getRelatedBlogPosts(slug: string, limit = 3): BlogPost[] {
  return getAllBlogPosts()
    .filter((post) => post.slug !== slug)
    .slice(0, limit);
}

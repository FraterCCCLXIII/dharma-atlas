import type { BlogPost } from "../types";

export const accountsClaimsPost: BlogPost = {
  slug: "accounts-claims-and-community-data",
  title: "Accounts, claims, and trusting community data",
  summary:
    "Why Dharma Atlas has member accounts, how claiming a listing works, and what trust means when a directory depends on community enrichment.",
  publishedAt: "2026-06-29",
  tags: ["building-in-open"],
  body: `An open directory without stewardship becomes a rumor mill. An account system without a clear purpose becomes friction. Dharma Atlas sits between those failures: most exploration is public, but the actions that change the record — claims, submissions, managed edits — need a member identity and a review path.

This post explains why accounts exist, how claiming works, what enrichment means after a claim, and how we think about trusting community data without pretending review is perfect.

## Why accounts exist at all

You can browse places, people, traditions, and pilgrimage routes without logging in. That is intentional. Practice discovery should not require a relationship with our product.

Accounts exist for a narrower set of jobs:

- Claiming a listing you represent
- Adding a missing place or person
- Managing and updating a listing after approval
- Receiving verification related to those actions
- Creating a durable trail for moderation when something goes wrong

In other words, accounts are for responsibility, not for locking the atlas behind a login wall. If you only want to find a sit near your hotel, you should never need a password. If you want to change what the public sees about a center, you should be willing to identify yourself.

This distinction also protects communities. Anonymous edits at scale invite spam, outdated self-promotion, and quiet vandalism. A claim flow with review is slower, and that slowness is a feature when the data points at real temples, monasteries, and teachers.

## The claim flow, in practical terms

Claiming starts when you recognize a listing and have a legitimate relationship to it. Maybe you manage the center. Maybe you handle communications for a monastery. Maybe you are the teacher named on a person page, or you officially represent that teacher's public information.

The [claim](/claim) path asks you to identify the listing and explain the relationship. We review claims rather than auto-approving them. Auto-approval would feel modern and would also make the directory easier to game. Review means a human looks for basic plausibility: does this person seem connected to the place, and is the request specific rather than vague?

After approval, place stewards get a manage surface for the listing — the loop where draft changes and publish requests keep public pages from becoming a free-edit wiki. Teacher and person tooling is still catching up in places; we would rather say that plainly than imply every claim type has the same post-approval experience today.

If the listing does not exist yet, claim is the wrong tool. Use [add](/add) to submit a new entry. Mixing "this is missing" with "this is mine" creates confused queues and slower reviews. The mental model is simple:

1. Missing entirely → add
2. Present but not yours to edit yet → claim
3. Already approved as steward → manage and update
4. You are a visitor who spotted an error → report or suggest a correction on the page

## Enrichment is the real work after ownership

Claiming is not the win condition. Enrichment is. A claimed profile that still has a wrong website, no visiting notes, and a five-year-old description is only slightly better than an unclaimed one. The point of stewardship is to make the public record useful for the next practitioner.

Useful enrichment usually looks ordinary:

- Correct name and address
- Current website and contact paths
- Clear tradition / lineage labels
- Offerings a newcomer can understand (weekly sit, retreats, courses, temple hours)
- Photos that show the place honestly
- Schedule links that still work
- Notes about accessibility, language, or visitor norms when known

We are not asking centers to write marketing essays. Short and current beats long and stale. If your community is quiet, say what a visitor should know and stop. If your community is complex, prioritize the facts that prevent a wasted trip.

Enrichment also includes knowing what not to publish. Private student lists, internal politics, and unverifiable claims about attainment do not belong on a public directory page. The atlas is for orientation, not for settling disputes inside a sangha.

## Trust is layered, not binary

People often ask whether listings are "verified." The honest answer is that trust has layers.

**Source trust.** Early records may come from public data and editorial cleanup. That gets a pin on the map; it does not make every field sacred.

**Steward trust.** A successful claim attaches responsibility. It does not guarantee perfection, but it creates a named channel for updates.

**Evidence trust.** Links, photos, consistent NAP (name, address, phone/web), and coherent tradition labels make a profile more believable.

**Community trust.** Corrections and reports from visitors catch drift between steward updates. This layer only works if reporting is easy and moderation is real.

**Temporal trust.** A great profile from three years ago can become misleading. Freshness matters. We would rather show a slightly incomplete page than a polished page that no longer matches the door on the street.

No single badge replaces these layers. Badges can help later; they can also create false confidence. For now, the product leans on transparent thinness, claim review, and steward edit loops.

## What we ask of claimants

If you claim a listing, please treat the public page as a service to newcomers, not as a branding channel. Practical courtesy looks like this:

- Update the fields that cause failed visits first (location, hours, links)
- Keep tradition labels accurate even when marketing language prefers broader terms
- Prefer stable URLs over campaign pages that disappear
- Do not remove other communities' affiliations to look more exclusive
- Respond to obvious errors when someone reports them

We also ask for patience with review. A slow yes is better than a fast wrong approval. If we ask a clarifying question, it is usually because the listing is ambiguous — similar names, multiple addresses, or a teacher affiliated with several places.

## What we ask of visitors

Visitors make the directory healthier when they report specifics. "This seems wrong" is harder to act on than "the website 404s" or "the weekly sit moved to Tuesday." If you can add a missing place through [add](/add), do that with the best public sources you have. If you cannot claim, you can still improve the atlas by being precise.

Please do not treat thin profiles as insults to a lineage. Coverage is uneven. Many excellent teachers and centers are under-documented simply because nobody has claimed them yet.

## Accounts and care with spiritual data

Spiritual communities are not restaurants, even when the directory patterns look similar. A wrong closing time is annoying. A wrong implication about authorization to teach, or a confused identity between similarly named teachers, can cause real harm.

That is why identity, claim review, and moderation matter more here than in a generic local index. It is also why we will keep person and place claims careful as volume grows. Scaling review is an operations problem we expect to feel. The alternative — unverified edits at internet speed — is worse for practitioners.

Email verification and account recovery exist to support this care, not to build a social network. We do not need your life story. We need enough assurance to attach edits to a responsible party.

## Where this is still incomplete

Beta honesty requires naming unfinished loops. Place managers already have a clearer path from claim to edit to publish request. Some teacher claim outcomes still need a stronger self-serve manage surface after approval. Calendar import and deeper offerings filters will make enrichment more valuable once they mature. Trust signals beyond Google ratings and correction reports are still ahead of us.

None of that means claims are pointless today. It means the directory is in the stage where stewardship tooling and catalog depth are racing each other. Public posts like this are how we keep that race visible.

## Closing

If you represent a center or teacher already in the atlas, take the concrete next step: start a [claim](/claim) for the listing you recognize, then enrich the fields that help a first-time visitor. If the community is missing, submit it through [add](/add) with the clearest public details you can share. Trustworthy community data is not a vibe; it is a series of small, accountable updates — and those updates are how Dharma Atlas stays useful after the first map load.`,
};

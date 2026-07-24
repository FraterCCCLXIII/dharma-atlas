import type { BlogPost } from "../types";

export const catalogChallengesPost: BlogPost = {
  slug: "hard-part-of-building-catalogs",
  title: "The hard part of building contemplative catalogs",
  summary:
    "Sourcing teachers and places, living with incomplete data, and designing for community corrections — what it actually takes to build a contemplative directory.",
  publishedAt: "2026-07-10",
  tags: ["catalogs"],
  body: `Building a directory of meditation centers, monasteries, and teachers sounds straightforward until you try it. The public maps are incomplete. Names change. Lineages branch. A center closes its doors quietly, or a teacher retires without updating a website last touched in 2014. What looks like a data problem is often a human one: communities move at the pace of practice, not at the pace of content management systems.

Dharma Atlas is an open catalog meant to help practitioners find places and people across traditions. That mission depends less on clever features than on careful sourcing, honest uncertainty, and room for the communities we list to correct us. This essay is about the hard part — the work that sits underneath a clean profile page.

## Sourcing teachers and places without overclaiming

Most contemplative catalogs begin with public sources: center websites, published teacher bios, retreat schedules, and community directories that already exist. Those sources are useful and incomplete in different ways. A temple website may list a residential teacher but omit visiting instructors. A national association may include member centers while leaving independent sitting groups invisible. A book jacket may name a lineage affiliation that the teacher themselves would describe more carefully.

We treat each public record as a starting point, not a verdict. When we add a person to the [people](/people) index or a location to [places](/places), we try to preserve what the community says about itself: the name they use, the tradition labels they claim, the address they publish. We do not invent seniority, authorization, or “official” status that a source does not support. If a teacher is associated with more than one school, we prefer to show that complexity rather than force a single label for the sake of a tidy filter.

Sourcing also means knowing when not to list someone. Private living rooms, invitation-only retreats, and communities that ask not to be indexed deserve that boundary. A catalog that claims to be complete is usually a catalog that has stopped listening. Our goal is coverage that is useful and respectful, not exhaustive at any cost.

The same caution applies to geography. A mailing address is not always a place of practice. A PO box, a shared office, or a seasonal site can mislead someone looking for a weekly sit. When location data is thin, we would rather show a city-level presence with a clear note than pretend we know the door code. Incomplete is better than confidently wrong.

## Living with incomplete data

Every field on a listing invites a false sense of finish. Hours of practice, accessibility notes, language of instruction, whether newcomers are welcome — these details matter to seekers, and they change. A schedule that was accurate last autumn may not survive a teacher sabbatical or a building renovation. Catalog builders feel pressure to fill every blank. That pressure is where false certainty begins.

We design for partial records. A place can be useful with a name, a tradition orientation, and a city even if we do not yet have phone hours or a full description. A teacher can appear with a short bio and a lineage note while we wait for a verified website or a claimed profile. Empty fields are not failures; they are invitations for the community to help. The alternative — guessing — trains users to distrust the whole directory when one invented detail turns out wrong.

Incomplete data also shows up in relationships. Teachers move between centers. Centers host teachers from several lineages. A monastery may be formally associated with one school while welcoming lay practitioners from many backgrounds. Modeling those links without collapsing them into a single “belongs to” edge is ongoing work. We would rather show a loose association and let the profile text explain it than encode a hierarchy we cannot defend.

For seekers, the practical implication is patience and cross-checking. Dharma Atlas is a map, not a substitute for contacting a community. When something looks promising, confirm with the place itself. When something looks wrong, tell us. The catalog improves when incompleteness is treated as shared maintenance rather than a secret.

## Avoiding false certainty in tradition and authority

Religious and contemplative language carries weight. Words like “authorized,” “ordained,” “recognized,” or “master” mean different things in different lineages, and they can be misused online. A catalog that repeats those words from a thin source can accidentally amplify a claim that the wider community would contest.

Our practice is conservative labeling. We prefer tradition and school tags that communities themselves use, and we keep descriptive text close to publicly stated affiliations. When sources conflict, we note uncertainty rather than pick a winner for the database. When a teacher’s path spans Zen practice, Theravāda retreats, and contemporary nondual teaching, we do not flatten that into one brand for the convenience of a filter chip.

False certainty also appears in rankings and “best of” framing. Dharma Atlas is not a review site. We do not score centers by popularity or declare which lineage is more authentic. Those judgments belong to practitioners and their teachers. Our job is to make discovery possible without pretending that a directory can settle questions of authority.

This restraint can feel unsatisfying if you want a definitive guide. It is also what keeps the catalog from becoming a quiet form of gatekeeping. Inclusive coverage across traditions only works if we resist the urge to adjudicate every contested detail from the outside.

## Import pipelines and the mess they leave behind

Scale requires imports. Manually typing every center is not sustainable, so we pull structured and semi-structured data from public listings, spreadsheets, and partner sources when available. Import pipelines save time and introduce a second class of errors: duplicated names with slightly different spellings, geocodes that snap to the wrong street, tradition tags inferred from a keyword in a description, and stale rows that outlive the community they describe.

A good pipeline is not a firehose. It needs normalization rules for names and addresses, deduplication that is cautious about merging distinct groups that share a city, and a review step before anything becomes publicly visible. Automated geocoding is especially fragile for rural temples, shared buildings, and places whose public address is approximate. When an import is unsure, the record should stay incomplete or held for human review rather than published with a confident pin on the wrong block.

We also treat imports as the beginning of stewardship, not the end. A bulk load that creates hundreds of profiles overnight is only valuable if those profiles can be claimed, corrected, and retired. Otherwise the directory accumulates ghosts — listings that look active but no longer match reality. Ghosts are worse than gaps because they waste a seeker’s trust.

Internally, we care as much about the audit trail as the fields themselves: where a fact came from, when it was last checked, and whether a community representative has claimed the page. That metadata rarely appears on the public profile, but it shapes how quickly we can fix a mistake when someone writes in.

## Community corrections as first-class infrastructure

No small team can keep a living contemplative map accurate alone. The people who know whether the Thursday sit still happens are the people who sit there. That is why submission and claim flows matter as much as the initial scrape.

If you know a place or teacher we are missing, you can [submit](/submit) a tip. If you represent a listing, claiming it lets you maintain details with more continuity than a one-off suggestion. Corrections — a closed center, a new address, a clearer tradition label — are not edge cases; they are the main maintenance loop. We try to make that loop calm and clear: what to send, what happens next, and how drafts become public after review.

Community input introduces its own challenges. Two people may disagree about how a center should be described. A well-meaning visitor may update hours incorrectly. Claims need enough verification to deter impersonation without turning every monastery into a paperwork exercise. None of that is solved by a single form. It is solved by moderation habits, transparent status (draft versus published), and a willingness to reverse a change when better information arrives.

The deeper design choice is cultural. A catalog that treats community corrections as an annoyance will slowly drift away from the people it lists. A catalog that treats them as partnership will still have errors — but the errors will be shorter-lived, and the tone of the project will stay collaborative rather than extractive.

## What “done” looks like for a contemplative catalog

There is no final version of Dharma Atlas. Traditions continue. Centers open and close. Teachers relocate. New practitioners look for a place to begin, and long-time practitioners look for communities that match a more specific path. The hard part of building this kind of catalog is accepting that the work is stewardship: careful sourcing, humility about what we know, pipelines that do not outrun review, and open doors for the people who practice in the places we map.

If you are exploring, start with [people](/people) and [places](/places). If you can help the map stay honest, [submit](/submit) what you know. The directory gets better the same way practice does — not by claiming certainty, but by returning, again and again, to what is actually there.`,
};

import type { BlogPost } from "../types";

export const placeProfilesPost: BlogPost = {
  slug: "richer-place-profiles",
  title: "Richer place profiles and community corrections",
  summary:
    "Place pages are becoming fuller records—photos, affiliations, offerings, and a path for submissions and corrections—so a listing can earn trust before anyone walks through the door.",
  publishedAt: "2026-07-22",
  tags: ["building-in-open"],
  body: `A pin on a map answers one question: where. A place profile has to answer the questions that come next. What tradition lives here? Who teaches? What does a first visit look like? Is there a photo that is not a stock sunset? Can someone who knows the place fix a wrong phone number without emailing a stranger and hoping?

Dharma Atlas has been investing in **richer place profiles** and in the community loops around them—submit, claim, correct, report. This is not a redesign for its own sake. Directories fail quietly when the detail page is a thin stub: name, address, maybe a website link. Practitioners bounce. Managers stop caring. The map becomes a graveyard of almost-useful dots.

This post is a field note on what place pages are meant to carry, how photos and affiliations fit, and how corrections work while we are still in beta. Start from [Explore](/places) if you want the live surface; read on if you want the reasoning.

## What a place page should hold

We treat a place page as a living record for a practice location—temple, center, monastery, group that meets in a borrowed room. The strong version of that record includes more than geocoding:

- **Identity:** name, type, locality, and a clear sense of what kind of place this is.
- **About:** language a visitor can skim before they commit travel time.
- **Photos:** real exterior or practice-space images when we have them; careful fallbacks when we do not.
- **Offerings and schedule signals:** what happens here—meditation, services, retreats, classes—without pretending we have a perfect citywide events product yet.
- **People:** teachers and related figures when the data exists.
- **Affiliations and tradition context:** lineage, network, or tradition links that help someone understand where this place sits in a wider landscape.
- **Practical contact:** website, socials, phone, notices managers need visitors to see.
- **Trust actions:** claim, suggest an edit, report a problem.

Not every listing has all of that today. Beta means uneven depth. Some places are carefully maintained by managers through the edit suite. Others are seed data with a thin about section and a single photo. The product job is to make fullness possible and visible—not to fake completeness with filler.

Layout-wise, we favor a readable profile over a dashboard of widgets. Photo mosaic when there are multiple images; a single hero when there is one; tradition-aware defaults when a place has no upload yet. Similar places nearby exist to keep exploration moving without forcing another search from scratch. Claim appears when the place is unclaimed, so ownership has a path instead of a dead end.

The point of richness is decision support. Someone deciding whether to visit on Tuesday evening should learn enough to show up respectfully—or decide this is not their door—without scraping three external sites and a Facebook page last updated in 2019.

## Photos, affiliations, and the texture of trust

**Photos** do more work than decoration. A clear facade helps you recognize the building. A practice room photo sets expectations about formality and space. A festival or community image can communicate warmth without a marketing department. Our place photo grid is built to handle uneven counts—two photos, four, five or more—without leaving awkward empty cells, and a lightbox lets you look without leaving the page.

We still have gaps. Some listings rely on tradition default imagery. That is an honest placeholder, not a claim that we photographed the altar. Managers can improve this; community submissions help; we would rather show a labeled default than a misleading scraped image. If you manage a place, photos are among the highest-leverage upgrades you can make.

**Affiliations** and tradition links are the other texture layer. Spiritual geography is not only coordinates. A center may sit in a Zen lineage, a Tibetan network, a Hindu temple society, or a cross-traditional mindfulness nonprofit. Showing that context helps visitors who care about lineage—and helps others understand why two places two blocks apart can feel like different worlds. Affiliations should stay factual and lightweight: useful orientation, not a politics engine.

Related people, offerings, and notices round out the same idea. The profile is a dossier, not a landing-page slogan. When data is missing, the page should feel unfinished in a productive way—invite a claim or correction—rather than padded with empty sections that pretend completeness.

A calm product voice matters here. We do not need badges that shout “Verified!” on every card. We need accurate hours when we have them, clear claim state, and a corrections path that works. Trust accumulates from small truths.

## Submissions, claims, and community corrections

No catalog of practice places stays accurate without the people who use those places. Seed data drifts. Groups move. Phone numbers die. Teachers rotate. Dharma Atlas therefore treats **submission and correction** as core product, not as a contact-form afterthought.

Paths that exist today, in plain language:

- **[Add a place](/add)** when something real is missing from the map.
- **[Submit](/submit)** flows for contributing structured information the catalog can review.
- **Claim** on an unclaimed profile when you are responsible for the place and want the manager tools.
- **Corrections / reports** when a listing is wrong, duplicate, closed, or harmful.

On the manager side, claimed places get an edit suite with a draft → request publish rhythm. That is deliberate. We want managers to improve listings without every keystroke going live unreviewed, and we want moderation to stay possible as the catalog grows. Admin tools cover submissions, claims, reports, and ontology work behind the scenes. Visitors should feel the result—better pages—without needing to see the queue.

Community corrections are especially important for addresses, names, and “this place closed” signals. A wrong pin wastes someone’s afternoon. A closed center left open on the map erodes trust in the whole directory. We would rather receive an awkward report than leave a confident falsehood online.

Beta honesty applies hard here. Moderation is not instantaneous. Not every submission will be accepted as-is. Teacher claim loops are still catching up to the place-manager experience in places—feature completeness notes call that out internally, and we are not pretending otherwise in public. The commitment is direction: community knowledge should be able to enter the system, be reviewed, and improve the public record.

If you are unsure whether to submit, prefer specificity. “Wrong street number; correct is …” beats “info seems off.” Photos with permission beat anonymous grabs. Lineage notes that a resident teacher would recognize beat generic adjectives.

## Why richer profiles change Explore and everything after

Explore and profiles are one product loop. Near You and map sync get you to a candidate set; the profile decides whether you go. Thin profiles make local Explore feel like a tease. Rich profiles make a shortlist meaningful.

They also unlock later layers. Offerings filters only help if offerings are captured on pages. Events discovery only helps if schedules are maintained. Books and traditions links only help if place records know how to point outward without becoming cluttered. SEO and structured data become worthwhile when the underlying entity is solid.

For practitioners, the ask is simple: use profiles as decision tools, and when something is wrong, say so through the product instead of assuming nobody cares. For managers, the ask is to claim and complete—photos, about, offerings, contact—so the public page matches the door you open on Sunday morning.

We are not trying to replace a center’s own website. Many places have beautiful sites, newsletters, and sangha channels. Dharma Atlas is the shared map and comparative record: enough truth in one place to discover, compare, and arrive. Richness should serve that job and then get out of the way.

## Closing: improve one listing, including your own

If you have five minutes, open a place you know on [Explore](/places) and read it like a newcomer. Is the address right? Would the photos help you find the entrance? Does the about section say what happens in the room? If not, claim it, [submit](/submit) an update, or [add](/add) a missing neighbor.

Richer profiles are not a launch feature we can declare done. They are a practice: catalog depth, manager care, and community corrections compounding over time. We are building that loop in the open, with uneven coverage and a moderation queue that is still learning the shape of real-world sanghas.

The map gets you close. The profile should earn the last mile of trust. Help us make that true for the places you love—and honest about the ones that have moved on.`,
};

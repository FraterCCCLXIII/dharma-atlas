import type { BlogPost } from "../types";

export const pilgrimagePlanningPost: BlogPost = {
  slug: "pilgrimage-planning",
  title: "Pilgrimage planning: routes, favorites, and share",
  summary:
    "How Dharma Atlas approaches pilgrimage as a catalog of routes and sites—with maps, favorites, share links, customize flows, and travel legs—so planning can stay practical and respectful.",
  publishedAt: "2026-07-23",
  tags: ["building-in-open"],
  body: `Pilgrimage is older than apps. People have walked circuits, island routes, mountain climbs, and city temple rounds long before anyone needed a share button. Software should not invent a new religion of itinerary gamification. At best it helps with memory, geography, sequencing, and the humble logistics of getting from one sacred stop to the next.

Dharma Atlas treats pilgrimage as its own catalog: routes and sites you can browse, map, favorite, customize, and share. This sits beside everyday Explore—your Tuesday night sit—without collapsing both into one undifferentiated “places” list. A neighborhood center and a multi-site circuit are related and not the same job.

This post covers what the pilgrimage layer includes today: the catalog, maps, favorites, share, customize, and travel links. It is also honest about gaps. Classical circuits are unevenly covered; some famous lists are modern compilations rather than canonical routes; photos and stop metadata vary. Open [Pilgrimage](/pilgrimage) to see the live catalog, then read on for how the planning tools fit together.

## A catalog of routes and sites, not a fantasy tour operator

The pilgrimage data model distinguishes **sites** and **routes**. Sites are individual sacred places—temples, stupas, mountains, shrines—with their own pages. Routes are ordered or thematic circuits that connect stops: classical Buddhist life sites, regional Hindu circuits, mountain monastery approaches, island pilgrimages, and more. Dynamic pages under the pilgrimage section let you open a route, read context, and see the stops in order.

We care about provenance more than spectacle. Some routes are ancient and widely attested. Others are ministry tourism circuits or contemporary curated lists. Internally we keep gap notes about what is missing, what is partial, and what should not be invented for completeness theater. That discipline matters. Shipping a confident “eight Himalayan pilgrimages” product route because a blog post grouped them is how catalogs lose trust.

What you should expect from a route page in practical terms:

- A clear title and short framing of why the circuit exists.
- Ordered stops with links into site detail when we have it.
- A map that shows the geography of the path, not only a pretty hero.
- Actions that help you plan: favorite, customize, share, and travel cues between legs where we support them.

Coverage will remain incomplete for a long time. Living pilgrimages like long river parikramas are enormous; temple counts in some traditions run into the dozens or hundreds. We prioritize high-signal circuits and honest partial progress over pretending the atlas is finished. If a route you love is missing, that is useful signal—especially when you can point to a stable traditional sequence rather than a vibes-based bucket list.

Photos are part of the catalog work too. Route and site imagery helps orientation, but we would rather show a careful download set than decorative filler. Where imagery is thin, the prose and map should still carry the page.

## Maps that help you see the path

Pilgrimage maps are not the same as Explore’s city pin cluster, even when they share rendering ideas. A route map has to communicate **sequence and span**: which stop follows which, how far the circuit stretches, whether you are looking at a walkable city temple round or a multi-country journey. Re-fitting the camera when someone reorders stops in customize should be stable enough that drag-and-drop planning does not feel like a seasick tour.

Site pages can show a single-place map for arrival context. Route pages show the constellation. Customized routes reuse the same visual language so a personal variant does not feel like a different product. The goal is geographic honesty: if two stops are a day’s travel apart, the map should not imply they are neighbors because that would look tidier.

Maps also keep planning embodied. A bullet list of temple names can hide the Himalaya. A map makes the commitment visible. That visibility is not meant to intimidate; it is meant to prevent surprise. Pilgrimage includes logistics, visas, seasons, and physical difficulty. Software cannot solve those, but it can stop flattening them into a checklist that looks like errands.

We still have work to do on mobile map comfort, dense stop labels, and routes that cross awkward longitudes. Beta means some maps will feel more polished than others. Correct stop order and sane framing matter more to us right now than animated path tracers.

## Favorites, share, and customize

Planning is social and personal at once. People save a route to revisit later. They send a link to a friend who might walk it next year. They drop a stop that does not fit their body or season, or add a related temple a teacher recommended. Dharma Atlas pilgrimage tools lean into those three verbs: **favorite**, **share**, and **customize**.

**Favorites** keep routes (and the broader favorite system) available when you return. This is intentionally low-drama: a saved pilgrimage should be easy to find again without building a separate travel-social network. Sign-in matters for syncing personalized routes; where account is required for customize updates, the product should say so clearly rather than failing silently.

**Share** produces a durable link to a route view—including customized routes with a share id—so you can pass a plan without exporting a spreadsheet. Native share sheets appear when the browser supports them; otherwise copy and common targets (mail, common social intents) cover the practical cases. Share text should stay plain: name of the route, enough context to recognize it, and the URL. No growth-hack captions.

**Customize** is where planning becomes yours. From a canonical route you can enter a customize flow, adjust stops, and save a personal variant. Maps update with the resolved stop set. Ownership and share paths differ for your saved route versus the canonical catalog entry—so friends can view what you shared without accidentally editing the atlas’s source circuit. If you are already saved, the UI should tell you that sharing remains available from the route page anytime.

These features sound simple and fail in fussy ways: auth gates, stale share ids, stop keys that collide, reordering that reshuffles map fit. We would rather harden those edges than add stickers and achievement badges on top of a fragile planner.

## Travel links between legs

A route without movement is a museum list. Between stops, people need trains, taxis, flights, walking paths, or the admission that a leg is its own expedition. Dharma Atlas includes **travel link** affordances on pilgrimage legs where we can point outward usefully—deep links into common travel tools rather than pretending we are a booking agency.

That boundary is important. We are not selling tickets. We are not scraping fares. We are acknowledging that the sacred path includes ordinary transit. A travel link should be optional, obvious, and external. If we cannot help, we should not invent a fake “easy transfer” suggestion.

Seasonality, permits, and local transport norms will always outrun a global web app. The catalog can warn and link; communities and guidebooks still do the deep work. Think of travel legs as bridges between our stop data and the wider logistics web—not as a closed trip builder.

As coverage grows, the temptation will be to over-automate. We plan to resist that. A calm pilgrimage product helps you see the next stop and how one might get there. It does not optimize your karma with an algorithm.

## How pilgrimage relates to Explore and the rest of Dharma Atlas

Pilgrimage and Explore share a planet and diverge in intent. Explore is optimized for local practice discovery—Near You, bounds sync, place profiles you might visit this month. Pilgrimage is optimized for circuits, history, and intentional travel over longer arcs. Cross-links will keep growing: a pilgrimage site may also be a place profile; a tradition article may contextualize why a circuit exists; books may prepare the mind for a journey.

Keeping the surfaces distinct prevents a common product mistake: treating every temple as the same card with the same “save” metaphor. Favoriting a neighborhood sangha and favoriting the Shikoku circuit are related acts with different planning horizons. Share and customize make sense for routes in a way they may not for every local listing.

If you are new here, a good path is: browse [Pilgrimage](/pilgrimage) for a circuit that matches your curiosity or tradition, open the map, favorite what you want to revisit, customize if you need a shorter or locally adapted variant, then share with whoever might walk it with you. For everyday practice near home, return to [Explore](/places). For missing places on either surface, [add](/add) what you know.

## Closing: plan lightly, travel respectfully

We are building pilgrimage tools in the open because sacred geography deserves careful catalogs more than it deserves hype. Routes will be incomplete. Some customize edges are still rough. Travel links are helpers, not guarantees. That is the honest state of a beta atlas.

If a route matters to you and it is missing or wrong, tell us with specifics—traditional order, alternate names, stops that should never be glued together for convenience. If a share link or favorite misbehaves, that is actionable too.

Use [Pilgrimage](/pilgrimage) as a planning desk, not as a substitute for local guidance, visas, physical training, or the etiquette of the places you enter. Let the map show the path. Let favorites hold your attention. Let share keep companions aligned. Let customize humble a grand circuit into the trip you can actually make.

Then close the laptop. The catalog is only a door.`,
};

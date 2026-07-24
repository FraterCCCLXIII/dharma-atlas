import type { BlogPost } from "../types";

export const exploreLocalPost: BlogPost = {
  slug: "making-explore-feel-local",
  title: "Making explore feel local: Near You and map sync",
  summary:
    "How Dharma Atlas ties Nominatim location search, the markers API, list/map bounds sync, and nearby badges so Explore feels like a neighborhood tool—not a global dump of pins.",
  publishedAt: "2026-07-20",
  tags: ["building-in-open"],
  body: `Most spiritual directories start global and stay that way. You open a map, see a cloud of pins across continents, and hope the search box somehow lands you somewhere useful. That pattern fails when someone is standing in a city, phone in hand, trying to find a place they can actually visit this week.

Dharma Atlas Explore is meant to feel local first. Recent work has been less about adding more places—though that continues—and more about making the surface behave like a neighborhood tool: find a place or area, frame the map, keep the list honest about what is on screen, and quietly mark what is near you. This post covers Nominatim-backed location search, Near You and nearby badges, the markers API, list/map bounds sync, and the practitioner situations we optimize for.

If you just want to try it, open [Explore](/places). The rest is a public record of what we shipped while the product is still beta.

## Nominatim search: somewhere versus something

Place name search and area search are different jobs. Searching for “Zen Center” should return matching places. Searching for “Oakland” or “Bodh Gaya” should move the map to that locality and show what we know there. Conflating those jobs produces confusing results: a city name ranked like a center, or a center buried under geographic noise.

We use **Nominatim** (OpenStreetMap’s geocoding service) for area and locality lookup. When you type into Explore search, area suggestions sit alongside place matches so you can choose intentionally. Pick an area and we resolve a bounding box, frame the map, and load markers for that region. The search UI labels those suggestions as areas—not “near”—so they are not confused with the Near You control.

Nominatim is not perfect. Coverage varies by country. Some spiritual sites sit in administrative units with names that do not match how practitioners talk about them. We keep the catalog’s own country and locality fields when they are clearer than a raw reverse-geocode label, especially for contested or special regions. The goal is not to outsource truth to a geocoder; it is to borrow a solid public index of where a string sits on the map, then show our place data inside that frame.

When location resolution fails—permission denied, sparse OSM data, ambiguous query—we fail quietly and leave you in a usable Explore state. Beta honesty: location is helpful, not required. You can always pan the map or search by place name without granting anything.

## Near You and nearby badges

Near You is the most direct local affordance. Press it and we resolve a location from browser geolocation when available, with a coarser IP-based fallback when it is not. From that point we derive bounds, frame the map, and let the markers and list APIs do their job. The control toggles off as clearly as it toggles on; leaving Near You for another search clears the GPS filter so you are not trapped in a radius you no longer want.

**Nearby badges** are a quieter sibling. Even when Near You is not the active filter, search results can show a “Near you” badge when a match falls inside remembered near bounds. That helps when you are searching by name—“insight,” “temple,” a teacher’s center—and want a quick signal that one of the hits is actually in your area.

Product instincts for this layer:

- **Local is a default posture, not a prison.** You can always zoom out to pilgrimage geography or another country.
- **Badges are hints; filters are commitments.** Visual nearness should not silently rewrite a search you typed with care.
- **Privacy is part of calm.** Location helps discovery; it is not the product.

## Markers API and list/map bounds sync

The markers path is built around bounds and filters. Explore requests markers for the current viewport and active filters through the explore markers API. There is a fuller fetch mode when needed, and a client cache so repeated pans do not thrash the network. Pins are typed and clustered; at low zoom they read as simple colored dots so the map stays legible.

Design constraints:

- **Viewport first.** Once you are looking at a region, pin queries prefer those bounds.
- **Filters travel with the request.** Tradition and type should shrink the pin set, not only the list after the fact.
- **Growth without camera yank.** When search-as-you-move or Near You expands pins, we should not constantly re-fit the camera. Framing a location and growing markers inside that frame are different operations.

The classic failure mode of map-and-list UIs is desync: the list shows twenty places “in Oakland” while the map has been panned to Berkeley. Dharma Atlas treats **map bounds as a first-class filter** once the viewport is established. Near You or an area search can seed the camera, but after that what you see on the map should drive what the list claims. When map-bounds sync is on, viewport bounds win even if a Near You or area chip is still selected. Pin queries scope to the viewport when bounds exist, so markers and list stay in the same conversation.

The loop we want:

1. Jump to an area, or press Near You.
2. Scan the list and the cluster.
3. Pan or zoom to refine.
4. Watch the list update to the visible set instead of clinging to the original seed.

## Practitioner use cases we optimize for

Engineering details only matter if they serve real visits. A few situations keep showing up.

**New in town for a week.** You land, grant location or search the city, press Near You, and skim what is reachable by transit or a short ride. You want two or three candidate doors and honest addresses. Bounds sync matters because you will pan from the hotel neighborhood to where evening sits happen.

**Returning to practice after a move.** You know words like “vipassana,” “zen,” or “temple,” but not street names. Name search plus nearby badges helps you spot which hits are local without turning every query into a hard radius filter. Then you open profiles and decide.

**Pilgrimage city with ordinary days between sacred stops.** Explore is not the pilgrimage planner; that lives under [Pilgrimage](/pilgrimage). Between circuit days you still need a local sit or a temple open to visitors. Area search for the city, then pan to where you are staying, keeps that job clear.

**Hosting or managing a center.** Local Explore is how newcomers find you without knowing your exact legal name. If Near You returns a thin set, the fix is often catalog completeness—photos, correct pin, claim—not another map animation. Keep your listing current; [add](/add) neighboring places you trust; correct what is wrong.

**Comparing across a metro.** Filters by tradition or type only help if markers and list obey the same bounds. The person who toggles a filter, pans across three neighborhoods, and still believes the count is deciding whether Dharma Atlas is usable. Sync makes that decision fair.

## Why this work matters, and what to try

People do not practice on a globe. They practice in rooms, parks, temples, and rented halls within a travel budget of time. A directory that cannot become local at the moment of need becomes a research toy.

Use [Explore](/places) as a local tool this week. Try Near You or an area search, then pan until the list matches the neighborhood you are actually in. If the map and list disagree, if Near You frames the wrong town, or if a badge appears when it should not, that feedback is useful. If you know a place that is missing, [add it](/add).

We are not promising a perfect city guide. We are promising a map and list that stay in conversation with each other—and a Near You path that treats your actual location as the point of departure, not an afterthought.`,
};

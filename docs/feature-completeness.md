# Feature Completeness — What’s Missing

Product gaps relative to a living practice directory (not a generic SaaS checklist). Grounded in the current Dharma Atlas surface: explore/map, place & teacher profiles, claim/submit, favorites, place-manager edit suite, and admin moderation.

**Last updated:** 2026-07-22

---

## Already strong

You’re solid as a **directory**:

- Map/explore with filters, search, near-you
- Rich place profiles (photos, about, offerings, teachers, events, socials, notices)
- Teacher/people pages
- Claim + submit + corrections/reports
- Favorites
- Place manager edit suite (`/manage`) with draft → request publish
- Admin moderation (submissions, claims, reports, ontology)

What’s missing is mostly the layer that turns a directory into a **living practice platform**.

---

## Highest leverage — close loops you already started

| # | Feature | Why it matters |
|---|---------|----------------|
| 1 | **Teacher self-serve after claim** | Claim UI exists, but approval doesn’t give teachers a manage surface. Places have a full owner loop; people don’t. |
| 2 | **Discover events across places** | Schedules live on profiles; there’s no “what’s near me this week” view. Strongest retention job you don’t serve yet. |
| 3 | **Filter explore by offerings** | Offerings are collected on profiles but unused in discovery. Easy win for “meditation / retreat / beginner” intent. |
| 4 | **Finish calendar import** | ICS/CSV work; Google OAuth + WordPress are still “coming soon.” Matters for manager adoption. |

---

## Trust & engagement

| # | Feature | Why it matters |
|---|---------|----------------|
| 5 | **Native reviews / visit notes** | You show Google ratings and accept correction reports, but no owned community trust signal. |
| 6 | **Manager analytics** | Views, favorites, click-outs, incomplete-profile tips. Managers need proof the listing works. |
| 7 | **Visitor → center contact** | Phone/website only. A simple “Ask about visiting” / RSVP path unlocks conversion without full messaging. |

---

## Growth & completeness

| # | Feature | Why it matters |
|---|---------|----------------|
| 8 | **Transactional email that matches the product** | Publish-live, claim outcomes (esp. teachers), calendar sync failures, optional “new near you” digests. |
| 9 | **SEO structured data** | JSON-LD for LocalBusiness / Event; events (+ books) in sitemap. Slugs/OG exist; schema is next. |
| 10 | **Books beyond beta** | Either wire books into teacher/place pages properly, or keep them quiet until first-class. |

---

## Later — marketplace / scale

Only pursue if you want to move beyond directory into marketplace:

- Promoted listings
- Donation / retreat booking
- Multi-manager roles on a place
- PWA / installable mobile surface
- Review moderation at scale

---

## Suggested next sequence

If sequencing the next 2–3 features for “feels complete”:

1. **Teacher manage** (close the claim loop)
2. **Global events discovery** (give people a reason to return)
3. **Offerings filters** (make existing profile data useful in explore)

---

## Related

- Engineering / ops backlog: [`ROADMAP.md`](../ROADMAP.md)
- Incomplete stubs already called out in product:
  - Google Calendar OAuth + WordPress import (`PlaceCalendarImportModal`)
  - Teacher claim approval without membership / manage surface
  - Books beta static affiliate shelf

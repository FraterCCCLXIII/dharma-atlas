# Dharma Atlas — Roadmap & Next Steps

Prioritized backlog across UX issues, functionality gaps, and new features. Generated from a codebase audit of routes, admin/owner flows, data pipeline scripts, and production readiness.

**Last updated:** 2026-06-30 — status reflects roadmap implementation work on `main` (uncommitted at time of update).

**Legend:** ✅ Done · 🔶 Partial · ⏳ Not started / deferred

---

## Do First (Trust, Security, Correctness)

These block user trust or can cause bad data in production.

| Status | # | Item | Why it matters |
|--------|---|------|----------------|
| ✅ | 1 | **Lock down `/admin` by role** | `requireAdminSession()` + admin layout role gate; `scripts/promote-user.ts` / `npm run auth:promote` for editors. |
| ✅ | 2 | **Geocode on create/approve** | `src/lib/geocode.ts` wired to manage create/update, submission approve; `missing_coords` quality flag on failure. |
| ✅ | 3 | **Fix submission approval data loss** | `submissions.payload` jsonb + approve action uses structured fields (type, tradition, address, lineage). |
| ✅ | 4 | **Email: implement or fix copy** | Brevo SMTP via `src/lib/email.ts`; hooks on claims, submissions, reports. |
| ⏳ | 5 | **Data quality pipeline pass** | Deferred per preference — run when ready: `pipeline:places:full`, review `scripts/reports/places-audit.csv`. Admin enrichment UI is in place. |

**Key files:** `src/middleware.ts`, `src/app/manage/actions/places.ts`, `src/app/admin/actions/submissions.ts`, `src/lib/geocode.ts`, `src/lib/email.ts`

---

## UX Issues

### High Impact

| Status | Finding | Details | Files |
|--------|---------|---------|-------|
| ✅ | **Site menu ignores auth state** | Session-aware menu: sign in/out, manage link, admin link when applicable. | `src/components/layout/SiteMenu.tsx` |
| ✅ | **Admin/manage shells not mobile-friendly** | Collapsible sidebar + hamburger on `< md`; active nav via `AdminNavLink` / `ManageNavLink`. | `AdminShell.tsx`, `ManageShell.tsx` |
| ✅ | **"View public page" on drafts 404s** | Draft copy + disabled link; "Preview unavailable — draft". | `OwnerPlaceForm.tsx` |
| ✅ | **Homepage still US-centric** | Global featured algorithm; worldwide metadata + `metadataBase`. | `feature-page.ts`, `layout.tsx` |
| ✅ | **No status after submit/claim** | `/manage` shows pending/approved/rejected claims and submissions. | `manage/page.tsx`, `claims.ts`, `submissions.ts` |
| 🔶 | **Explore performance** | List virtualization + map clustering (>80 markers) + SQL `getSimilarPlaces`. Homepage still loads full directory via `ExplorePage` — see server-side explore refactor below. | `PlaceList.tsx`, `PlaceMap.tsx`, `ExplorePage.tsx` |

### Medium / Polish

| Status | Finding | Details | Files |
|--------|---------|---------|-------|
| ✅ | **Claim search capped at 10 results** | Paginated search API + "Load more" in claim UI. | `api/places/search`, `ClaimLocationPageView.tsx` |
| 🔶 | **No route-level loading states** | `loading.tsx` on home, admin, locations (text placeholders — not full skeletons). | `src/app/**/loading.tsx` |
| ✅ | **Admin nav never highlights active page** | `usePathname()` + `data-active` on nav links. | `AdminNavLink.tsx`, `AdminShell.tsx` |
| ✅ | **Admin dashboard omits claims** | Claims card + publish-request queue card on dashboard. | `admin/page.tsx` |
| ✅ | **Report modal: no focus trap** | Initial focus + focus trap on open. | `ReportEntryModal.tsx` |
| ✅ | **Place photo grid: secondary tiles lack alt text** | Gallery cells use `<img alt=…>`. | `PlacePageView.tsx` |
| 🔶 | **Detail pages lack mobile list/map toggle** | Mobile back-to-map link on detail nav; full explore-style list/map toggle not added. | `SiteHeader.tsx` |

---

## Functionality Issues

### Security & Abuse

| Status | Finding | Details | Files |
|--------|---------|---------|-------|
| 🔶 | **Open signup, no email verification** | `REQUIRE_EMAIL_VERIFICATION` toggle + Brevo verification hook in `auth.ts`; off by default. Claim/submit gating not enforced yet. | `auth.ts`, `.env.example` |
| 🔶 | **No rate limiting / CAPTCHA** | In-memory rate limits on submissions, claims, reports, places search. Honeypot not added. | `rate-limit.ts`, API routes |
| ✅ | **`editor` role exists but no assignment path** | `scripts/promote-user.ts`, `npm run auth:promote`. | `permissions.ts`, `scripts/promote-user.ts` |

### Owner / Admin Workflows

| Status | Finding | Details | Files |
|--------|---------|---------|-------|
| 🔶 | **Member manage is a narrow subset** | Owners can edit type, tradition, hours, address (geocodes on address change). Coords read-only; faith/schools still admin-only. | `OwnerPlaceForm.tsx`, `owner-place.ts` |
| ✅ | **Draft publish is admin-only** | "Request publish" button + `publishRequestedAt` column; admin dashboard queue. | `manage/actions/places.ts`, schema |
| ✅ | **Claims without `placeId` cannot be approved in UI** | Admin place-link search before approve. | `ClaimsAdminList.tsx`, `linkClaimPlaceAction` |
| ✅ | **Teacher submission approval loses metadata** | Uses `payload` tradition/lineage on approve. | `admin/actions/submissions.ts` |
| ✅ | **Admin quality flags not actionable** | Filter chips by flag type on admin places list. | `PlacesAdminSearch.tsx` |
| ✅ | **No outbound notifications** | Brevo email on create/review for submissions, claims, reports. | `email.ts`, API + admin actions |

### Performance & Ops

| Status | Finding | Details | Files |
|--------|---------|---------|-------|
| 🔶 | **Full-table reads on explore** | `getSimilarPlaces` uses SQL LIMIT. Explore homepage still calls `getAllPlaces()` + `getAllTeachers()`. `/api/explore/*` routes exist but explore UI not refactored to fetch paginated client-side. | `ExplorePage.tsx`, `data/places.ts` |
| 🔶 | **Everything `force-dynamic`** | Place/person detail pages use `revalidate = 3600`. Root layout + home/locations/people still `force-dynamic`. | `place/[id]`, `person/[slug]`, `layout.tsx` |
| 🔶 | **Zero automated tests** | Vitest + starter tests (`permissions`, submission parse, coords helper). Not full coverage of auth/claim/place-access. | `src/lib/__tests__/`, `vitest.config.ts` |
| ✅ | **No CI pipeline** | `.github/workflows/ci.yml` — lint, typecheck, test, build. | `.github/workflows/` |
| ✅ | **No `error.tsx` boundaries** | Error boundaries on root, admin, place, person. | `src/app/**/error.tsx` |
| ✅ | **Health check hits `/` only** | `/api/health` DB ping; Dockerfile healthcheck updated. | `api/health`, `Dockerfile` |

---

## New Features

### Data & Content (README-Aligned)

| Status | Feature | Rationale | References |
|--------|---------|-----------|------------|
| 🔶 | **Scheduled pipeline runs** | Weekly GitHub Action (`pipeline.yml`); uses `--quick` — full enrichment still manual. | `.github/workflows/pipeline.yml` |
| ⏳ | **Google Places enrichment at scale** | Optional keys documented; run when ready. | `enrich-google-places.py` |
| ⏳ | **Global discovery** | Under-covered regions. | `discover-google-places.py` |
| 🔶 | **Admin bulk remediation** | Bulk geocode API (`/api/admin/places/bulk/geocode`); flag filter UI. No multi-select bar, CSV export, or photo-fetch queue yet. | `PlacesAdminSearch.tsx`, bulk API |
| ⏳ | **Encoding fix pass** | 173 places with `encoding_error`. | `scripts/lib/place_utils.py` |
| ⏳ | **Hindu ashrams / extra map layers** | Extend via `import-sources`. | `README.md` |

### User & Owner Flows

| Status | Feature | Rationale | References |
|--------|---------|-----------|------------|
| ✅ | **Email notifications** | Brevo transactional email for users and admin alerts. | `email.ts` |
| ✅ | **Geocoding on create/approve** | Nominatim geocode module. | `geocode.ts`, manage + admin actions |
| ✅ | **Submission approval preserves submitter fields** | `payload` jsonb on submissions. | schema, `approveSubmissionAction` |
| ✅ | **User status dashboard on `/manage`** | Claims + submissions sections. | `manage/page.tsx` |
| ✅ | **"Request publish" for member drafts** | Owner button + admin queue. | `OwnerPlaceForm.tsx`, schema |
| ✅ | **Teacher claim flow** | `/claim/person` + `teacher_slug` on claims. | `ClaimTeacherPageView.tsx` |
| ✅ | **Place ↔ teacher linking on public pages** | Teachers at place via retreats match + tradition fallback. | `PlaceTeachersSection.tsx` |
| ✅ | **Duplicate detection on submit** | "Did you mean?" on location submit. | `check-duplicates` API, `SubmitEntryPageView.tsx` |

### Discovery & Scale

| Status | Feature | Rationale | References |
|--------|---------|-----------|------------|
| 🔶 | **Server-side explore search + pagination** | API routes exist; explore page still server-loads full dataset. | `/api/explore/places`, `/api/explore/teachers` |
| ✅ | **Map marker clustering** | `leaflet.markercluster` when >80 places. | `PlaceMarkerCluster.tsx`, `PlaceMap.tsx` |
| ✅ | **Global featured-places algorithm** | US bounds removed. | `feature-page.ts` |
| ✅ | **List virtualization** | `@tanstack/react-virtual` on explore lists. | `PlaceList.tsx`, `TeacherList.tsx` |
| 🔶 | **ISR / caching for public detail pages** | `revalidate = 3600` on place/person; explore/home still dynamic. | place/person pages |

### SEO, Ops & Quality

| Status | Feature | Rationale | References |
|--------|---------|-----------|------------|
| ✅ | **Sitemap + robots.txt** | `sitemap.ts`, `robots.ts`. | `src/app/` |
| 🔶 | **Automated test suite** | Starter tests only — expand auth, claim approve, place access. | `src/lib/__tests__/` |
| ✅ | **CI (lint, build, migrate check)** | GitHub Actions CI workflow. | `.github/workflows/ci.yml` |
| ✅ | **`typecheck` script** | `tsc --noEmit` in `package.json`. | `package.json` |
| ✅ | **DB-aware health check** | `/api/health`. | `Dockerfile` |

---

## Suggested Roadmap (3 Phases) — Progress

### Phase 1 — Fix What's Broken

| # | Item | Status |
|---|------|--------|
| 1 | Admin route authorization | ✅ |
| 2 | Geocoding for new/approved places | ✅ |
| 3 | Submission approval preserves metadata | ✅ |
| 4 | Email notifications | ✅ |
| 5 | Data pipeline pass on audit flags | ⏳ deferred |

### Phase 2 — Owner & UX Polish

| # | Item | Status |
|---|------|--------|
| 6 | Session-aware site menu; mobile admin/manage nav | ✅ |
| 7 | Claim/submission status on `/manage` | ✅ |
| 8 | Global homepage featuring; metadata | ✅ |
| 9 | Draft preview link / hide public link for drafts | ✅ |

### Phase 3 — Scale & Grow

| # | Item | Status |
|---|------|--------|
| 10 | Server-side explore + clustering + virtualization | 🔶 (clustering + virtualization done; explore refactor partial) |
| 11 | Pipeline automation + notifications | 🔶 (notifications ✅; pipeline cron ✅ quick mode; full pass ⏳) |
| 12 | Test suite + CI | 🔶 (CI ✅; starter tests only) |
| 13 | Sitemap, caching, DB health checks | 🔶 (sitemap + health ✅; caching partial) |
| 14 | Teacher claims + place–teacher links | ✅ |

---

## Remaining Work (Recommended Next)

1. **Run data pipeline** — `npm run pipeline:places:full` against production audit backlog (#5 in Do First).
2. **Refactor explore** — Home/locations fetch paginated data from `/api/explore/*` instead of `getAllPlaces()` / `getAllTeachers()`.
3. **Remove root `force-dynamic`** — Split layouts so explore stays dynamic; allow static/ISR where possible.
4. **Bulk admin UI** — Multi-select places + geocode/export actions in `PlacesAdminSearch`.
5. **Enforce email verification** — Set `REQUIRE_EMAIL_VERIFICATION=true` after Brevo is live in production.
6. **Expand test coverage** — claim approve, place access, geocode cache.
7. **Content ops** — Google enrichment, global discovery, encoding fix pass (when ready).

---

## Already Solid (Extend, Don't Rebuild)

These are substantial and mostly working — next work is polish and integration:

- **Explore map + filters + mobile toggle** — `ExplorePageClient.tsx`, `SiteHeader.tsx`
- **Admin CMS** — places, teachers, ontology, submissions, claims, reports, backup — `src/app/admin/*`
- **Member manage + claim** — `/manage`, `/claim`, `/claim/person`
- **Report modal** — `ReportEntryModal.tsx`
- **Coolify deploy + cloud API** — `README.md`, `Dockerfile`, `npm run cloud`
- **Ontology-driven tradition filters** — `OntologyEditor.tsx`, `TraditionPickerField.tsx`
- **GA4 tracking** — `@next/third-parties/google` in root layout

---

## Operational Commands

Key scripts referenced throughout this roadmap:

```bash
npm run pipeline:places:full      # Full data enrichment pipeline
npm run discover-google-places    # Global discovery via Google Places
npm run enrich-google-places      # Enrich existing records
npm run download-place-photos     # Fetch venue photos
npm run db:seed                   # Seed JSON into Postgres
npm run export-places             # Export DB back to JSON
npm run auth:create-owner         # Promote user to owner
npm run auth:promote              # Promote user to editor (or owner)
npm run backup                    # Database backup
npm run cloud                     # Remote admin API
npm run typecheck                 # TypeScript check
npm run test                      # Vitest
```

Review `scripts/reports/places-audit.csv` after running the pipeline.

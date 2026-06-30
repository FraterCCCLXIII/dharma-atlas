# Dharma Atlas

An Airbnb-style discovery app for Buddhist temples, monasteries, meditation centers, and ashrams worldwide.

## Features

- Interactive map with synced list + marker selection
- Search and filter by place type and tradition
- Mobile list/map toggle
- 5,600+ locations from Google Places discovery, BuddhaNet, dhamma.org, Shambhala KML, and more

## Stack

- **Next.js 16** (App Router, React 19)
- **Tailwind CSS v4** with custom design tokens
- **Leaflet** + react-leaflet for maps
- **Motion** for UI transitions
- **Zustand** for explore state
- Design guided by [Taste Skill](https://www.tasteskill.dev/)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Re-import map data

```bash
node scripts/import-kml.mjs
```

This fetches the latest KML export from Google My Maps and writes `src/data/places.json`.

## Data pipeline (locations)

The app reads **places from Postgres** at runtime (`src/lib/data/places.ts`). `src/data/places.json` is the bulk staging file for imports and git snapshots.

```bash
# Google Places enrichment (website, phone, hours, coords, description, photo)
npm run enrich-google-places

# Discover new centers globally via Google Places Text Search (Europe, Asia, Africa, Middle East)
npm run discover-google-places -- --dry-run --region europe --limit-cells 1
npm run discover-google-places -- --region asia --region africa --grid 3
npm run discover-google-places -- --full   # all ~130 metros, 3×3 grid, ~35 queries each

# Full pipeline (includes optional discovery step); use --google to skip OSM scrape steps
npm run pipeline:places:full
npm run pipeline:places:full -- --google

# Recover websites from dhamma.org + BuddhaNet scrape (fast, no Overpass)
npm run recover-source-urls

# Quick cleanup only (strip bad URLs, normalize phones, refresh flags)
npm run pipeline:places -- --quick

# Fetch real venue photos where possible (website og:image, Wikipedia, Commons)
npm run download-place-photos -- --limit=100

# Export DB back to JSON after admin edits
npm run export-places

# Seed JSON into Postgres (smart merge respects verified fields)
npm run db:seed
```

Review `scripts/reports/places-audit.csv` after running the pipeline.

Optional env keys for higher recovery rates: `GOOGLE_PLACES_API_KEY`, `GOOGLE_GEOCODING_API_KEY`.

## Remote admin API (Coolify / Cursor)

Set `ADMIN_API_KEY` on the server and locally (`REMOTE_APP_URL` + same key). Then use the HTTP API or CLI:

```bash
npm run cloud -- seed --from-files
npm run cloud -- upload-place-photo <placeId> ./photo.jpg
npm run cloud -- update-place <placeId> ./place.json
npm run cloud -- revalidate --all
```

See `.env.example` and `coolify.env.example` for required variables.

## Deploying to Coolify

Repository: [github.com/FraterCCCLXIII/dharma-atlas](https://github.com/FraterCCCLXIII/dharma-atlas)

### 1. Postgres service

Create a **Postgres 16** database in Coolify. Note the internal connection URL.

### 2. Application service

| Setting | Value |
|---------|-------|
| Build pack | **Dockerfile** |
| Port | **3000** |
| Health check | `/` |

Copy variables from `coolify.env.example` into Coolify → Environment. Generate secrets:

```bash
openssl rand -hex 32   # BETTER_AUTH_SECRET
openssl rand -hex 32   # ADMIN_API_KEY
```

Set `BETTER_AUTH_URL` to your public domain (e.g. `https://dharma.example.com`).

### 3. Persistent storage (required for uploads)

| Container path | Purpose |
|----------------|---------|
| `/app/public/places` | Location photos |
| `/app/public/people` | Teacher/person photos |

On first boot, empty volumes are auto-seeded from the image. Admin uploads persist across redeploys.

### 4. First deploy bootstrap

After the app is healthy:

```bash
# Seed database (from your machine)
REMOTE_APP_URL=https://your-domain.com ADMIN_API_KEY=... npm run cloud -- seed --from-files

# Create owner account (DATABASE_URL via Coolify tunnel or public port)
DATABASE_URL=postgresql://... npm run auth:create-owner -- you@example.com 'your-password' 'Your Name'
```

Migrations run automatically on container start.

### 5. Local `.env.local` for Cursor

```env
REMOTE_APP_URL=https://your-domain.com
ADMIN_API_KEY=<same-as-coolify>
```

## Data note

The directory includes global Buddhist centers (BuddhaNet, dhamma.org, Shambhala KML, and more). Use `npm run discover-google-places` to find additional temples, monasteries, and ashrams via Google Places in under-covered regions. Hindu ashrams and additional map layers can also be extended via `npm run import-sources`.

## Attribution

Place data sourced from *Buddhist Centers, Temples, and Monasteries in the US* (Shambhala Publications) via Google My Maps.

Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.

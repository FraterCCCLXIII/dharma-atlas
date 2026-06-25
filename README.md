# Dharma Directory

An Airbnb-style discovery app for Buddhist temples, monasteries, meditation centers, and ashrams across the United States.

## Features

- Interactive map with synced list + marker selection
- Search and filter by place type and tradition
- Mobile list/map toggle
- 627+ seeded locations from [Shambhala Publications' Google My Maps](https://www.google.com/maps/d/u/0/viewer?mid=1NrKT9tt74PDeKaq9aFQ4FQZjSrVU9j4)

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

## Data note

The seed map focuses on Buddhist centers in the US. Hindu ashrams and temples can be added by extending the dataset or importing additional map layers.

## Attribution

Place data sourced from *Buddhist Centers, Temples, and Monasteries in the US* (Shambhala Publications) via Google My Maps.

Map tiles © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.

#!/usr/bin/env bash
# Full Google Places discovery → enrich → photos → Postgres seed
# Resumable: discovery cache skips completed searches; re-run safely after failures.
set -uo pipefail
cd "$(dirname "$0")/.."
if [[ -f .env.local ]]; then set -a; source .env.local; set +a; fi

LOG="scripts/reports/full-discovery-import.log"
mkdir -p scripts/reports

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

log "=== 1/5 Google Places discovery (all regions, 3×3 grid) ==="
while true; do
  if PYTHONUNBUFFERED=1 python3 scripts/discover-google-places.py --full --grid 3 2>&1 | tee -a "$LOG"; then
    break
  fi
  log "Discovery interrupted — resuming from cache in 10s…"
  sleep 10
done

log "=== 2/5 Google enrich — contact/hours for places missing googlePlaceId ==="
PYTHONUNBUFFERED=1 python3 scripts/enrich-google-places.py --only-missing 2>&1 | tee -a "$LOG" || log "Google enrich (missing ids) had errors — continuing"

log "=== 3/5 Google photo download for all places missing photos ==="
PYTHONUNBUFFERED=1 python3 scripts/enrich-google-places.py --only-missing-photo 2>&1 | tee -a "$LOG" || log "Google photo enrich had errors — continuing"

log "=== 4/5 Fallback photos (website og:image, Wikipedia, Commons) ==="
npm run download-place-photos 2>&1 | tee -a "$LOG"

log "=== 5/5 Seed Postgres ==="
npm run db:seed 2>&1 | tee -a "$LOG"

log "=== DONE ==="
python3 -c "
import json
from pathlib import Path
d = json.loads(Path('src/data/places.json').read_text())
places = d['places']
with_photo = sum(1 for p in places if p.get('photo'))
with_google = sum(1 for p in places if p.get('googlePlaceId'))
disc = sum(1 for p in places if 'google_places_discovery' in (p.get('dataSource') or ''))
print(f'Total places: {len(places)}')
print(f'Google Discovery: {disc}')
print(f'With googlePlaceId: {with_google}')
print(f'With photo: {with_photo}')
" | tee -a "$LOG"

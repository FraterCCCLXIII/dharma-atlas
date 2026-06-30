#!/usr/bin/env bash
# Google + fallback photos only (no discovery)
set -uo pipefail
cd "$(dirname "$0")/.."
if [[ -f .env.local ]]; then set -a; source .env.local; set +a; fi

LOG="scripts/reports/photos-only.log"
mkdir -p scripts/reports

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

log "=== 1/3 Google Places photos ==="
PYTHONUNBUFFERED=1 python3 scripts/enrich-google-places.py --only-missing-photo 2>&1 | tee -a "$LOG"

log "=== 2/3 Fallback photos (website, Wikipedia, Commons) ==="
npm run download-place-photos 2>&1 | tee -a "$LOG"

log "=== 3/3 Seed Postgres ==="
npm run db:seed 2>&1 | tee -a "$LOG"

log "=== DONE ==="
python3 -c "
import json
from pathlib import Path
places = json.loads(Path('src/data/places.json').read_text())['places']
print(f'Total: {len(places)}')
print(f'With photo: {sum(1 for p in places if p.get(\"photo\"))}')
print(f'Google photos: {sum(1 for p in places if p.get(\"photoSource\")==\"google_places\")}')
" | tee -a "$LOG"

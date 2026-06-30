#!/usr/bin/env bash
# Continue place pipeline.
# Usage: ./scripts/pipeline-continue.sh [from-step]
#   from-step: clean | regeocode | google-enrich | recover-sources | recover | enrich | seed
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f .env.local ]]; then set -a; source .env.local; set +a; fi

FROM="${1:-google-enrich}"
LOG="scripts/reports/pipeline-full.log"
echo "=== pipeline-continue from=$FROM $(date) ===" >> "$LOG"

export PYTHONUNBUFFERED=1

run() { echo "▶ $1" | tee -a "$LOG"; eval "$2" >> "$LOG" 2>&1; }

if [[ "$FROM" == clean ]]; then
  run "clean-places" "python3 scripts/clean-places.py"
  FROM=regeocode
fi
if [[ "$FROM" == regeocode ]]; then
  run "regeocode-places" "python3 scripts/regeocode-places.py"
  FROM=google-enrich
fi
if [[ "$FROM" == google-enrich ]]; then
  run "enrich-google-places" "python3 scripts/enrich-google-places.py --only-missing"
  FROM=seed
fi
if [[ "$FROM" == recover-sources ]]; then
  run "recover-source-urls" "python3 scripts/recover-source-urls.py"
  FROM=recover
fi
if [[ "$FROM" == recover ]]; then
  run "recover-websites" "python3 scripts/recover-websites.py"
  FROM=enrich
fi
if [[ "$FROM" == enrich ]]; then
  run "enrich-places" "python3 scripts/enrich-places.py"
  FROM=descriptions
fi
if [[ "$FROM" == descriptions ]]; then
  run "fetch-descriptions" "python3 scripts/fetch-descriptions.py"
  FROM=photos
fi
if [[ "$FROM" == photos ]]; then
  run "download-place-photos" "npm run download-place-photos"
  FROM=seed
fi
if [[ "$FROM" == seed ]]; then
  run "db:seed" "npm run db:seed"
  run "audit" "python3 scripts/audit-places.py"
fi

echo "=== pipeline-continue finished $(date) ===" >> "$LOG"

#!/usr/bin/env bash
# Wait for recover-websites to finish, then run enrich → descriptions → photos → seed.
set -euo pipefail
cd "$(dirname "$0")/.."

LOG="scripts/reports/pipeline-full.log"
echo "=== auto-continue watcher started $(date) ===" | tee -a "$LOG"

while pgrep -f "python3 scripts/recover-websites.py" >/dev/null 2>&1; do
  sleep 30
done

echo "=== recover finished — starting enrich+ $(date) ===" | tee -a "$LOG"

if [[ -f .env.local ]]; then set -a; source .env.local; set +a; fi
export PYTHONUNBUFFERED=1
bash scripts/pipeline-continue.sh enrich >> "$LOG" 2>&1

echo "=== auto-continue finished $(date) ===" | tee -a "$LOG"

#!/bin/sh
set -eu

seed_uploads_if_empty() {
  name="$1"
  target="/app/public/$name"
  seed="/app/.photo-seed/$name"

  mkdir -p "$target"

  if [ ! -d "$seed" ]; then
    return 0
  fi

  if [ -z "$(find "$target" -mindepth 1 -print -quit 2>/dev/null)" ]; then
    echo "Seeding empty volume: public/$name"
    cp -a "$seed/." "$target/"
    return 0
  fi

  copied=0
  updated=0
  for seed_file in "$seed"/*; do
    [ -f "$seed_file" ] || continue
    base="$(basename "$seed_file")"
    dest="$target/$base"
    if [ ! -e "$dest" ]; then
      cp -a "$seed_file" "$dest"
      copied=$((copied + 1))
    elif [ "$(wc -c < "$seed_file")" != "$(wc -c < "$dest")" ] \
      || [ "$seed_file" -nt "$dest" ]; then
      # Replace stale volume copies when the image ships a different/newer seed.
      # Size check catches same-mtime Docker layer cases where -nt alone misses.
      cp -a "$seed_file" "$dest"
      updated=$((updated + 1))
    fi
  done

  if [ "$copied" -gt 0 ] || [ "$updated" -gt 0 ]; then
    echo "Merged public/$name: $copied new, $updated updated"
  fi
}

echo "Preparing upload directories…"
seed_uploads_if_empty "places"
seed_uploads_if_empty "people"
seed_uploads_if_empty "pilgrimage"

echo "Running migrations…"
node /app/scripts/db-migrate-prod.mjs

echo "Starting Next.js on port ${PORT:-3000}…"
exec node /app/server.js

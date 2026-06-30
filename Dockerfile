# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
# Coolify injects NODE_ENV=production at build time, which skips devDependencies
# (tailwindcss, typescript, etc.) unless we opt in explicitly.
RUN npm ci --ignore-scripts --include=dev

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Placeholders for build-time module init (runtime values come from Coolify)
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
ENV BETTER_AUTH_SECRET=docker-build-placeholder-secret-32chars
ENV BETTER_AUTH_URL=http://localhost:3000
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

RUN apk add --no-cache wget

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/postgres ./node_modules/postgres
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts/db-migrate-prod.mjs ./scripts/db-migrate-prod.mjs
COPY --from=builder /app/scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
COPY --from=builder /app/src/data ./src/data

# Seed copies for empty Coolify persistent volumes
RUN mkdir -p /app/.photo-seed \
  && cp -a /app/public/places /app/.photo-seed/places \
  && cp -a /app/public/people /app/.photo-seed/people \
  && chown -R nextjs:nodejs /app/.photo-seed

RUN chmod +x /app/scripts/docker-entrypoint.sh \
  && mkdir -p /app/public/places /app/public/people \
  && chown -R nextjs:nodejs /app/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT:-3000}/" >/dev/null 2>&1 || exit 1

ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]

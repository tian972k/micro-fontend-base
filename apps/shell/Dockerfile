# syntax=docker/dockerfile:1

# Build context is the repository root:
#   docker build -f apps/shell/Dockerfile .

FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Install, build, then extract the shell with production dependencies only.
FROM base AS builder
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm turbo run build --filter=shell
# pnpm keeps each workspace's dependencies in its own node_modules (linked
# into the root store), so copying the root node_modules is not enough.
# `pnpm deploy` writes a self-contained copy of the shell's runtime deps.
RUN pnpm --filter shell deploy --prod /out

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# The port remix-serve listens on (docker-compose maps 8000 -> 3000).
ENV PORT=3000

COPY --from=builder /out/node_modules ./node_modules
COPY --from=builder /out/package.json ./package.json
COPY --from=builder /app/apps/shell/build ./build
COPY --from=builder /app/apps/shell/public ./public

# SESSION_SECRET is required at runtime (see docker-compose.yml).
USER node
EXPOSE 3000
CMD ["node_modules/.bin/remix-serve", "./build/server/index.js"]

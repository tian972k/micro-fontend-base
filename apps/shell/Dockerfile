# Base stage for dependencies
FROM node:18-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY . .

# Install dependencies
FROM base AS deps
RUN pnpm install --frozen-lockfile

# Build the shell
FROM deps AS builder
RUN pnpm turbo run build --filter=shell

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Add more env variables as needed

COPY --from=builder /app/apps/shell/build ./build
COPY --from=builder /app/apps/shell/public ./public
COPY --from=builder /app/apps/shell/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]

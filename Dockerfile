FROM node:20-alpine AS base

# Install pnpm
# pnpm is PINNED deliberately: `pnpm@latest` floated to 11.x, which imports
# node:sqlite -- a builtin absent from Node 20 -- so corepack installed it
# happily (its engines field claims >=18.12) and the build died at run time
# with ERR_UNKNOWN_BUILTIN_MODULE. Nothing in the repo changed that day.
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile || pnpm install

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

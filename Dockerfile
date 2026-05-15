# ═══════════════════════════════════════════════════════
# LinkGuard - Multi-stage Docker Build
# ═══════════════════════════════════════════════════════
# Optimized for production deployment with Bun runtime
# Supports: Docker, Docker Compose, Railway, Render, Fly.io
# ═══════════════════════════════════════════════════════

# ─── Stage 1: Dependencies ───
FROM oven/bun:1-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production=false

# ─── Stage 2: Build ───
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build Next.js application
RUN bun run build

# ─── Stage 3: Production ───
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy Prisma schema for migrations
COPY --from=builder /app/prisma ./prisma

# Create database directory
RUN mkdir -p /app/db && chown nextjs:nodejs /app/db

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", ".next/standalone/server.js"]

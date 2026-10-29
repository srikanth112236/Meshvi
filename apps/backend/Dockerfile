# ==============================================================================
# MESHVI BACKEND PRODUCTION DOCKERFILE
# Multi-stage optimized build for NestJS & Prisma
# ==============================================================================

# Stage 1: Builder
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# Install build dependencies (OpenSSL required for Prisma, Python & GCC for native addons)
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl python3 make g++ ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy root and workspace package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/mobile/package*.json ./apps/mobile/

# Install dependencies (disable strict engine check to accommodate cross-platform mobile packages)
RUN npm ci --no-audit --engine-strict=false

# Copy Prisma schemas (both root and workspace)
COPY prisma ./prisma
COPY apps/backend/prisma ./apps/backend/prisma

# Copy source code and compiler configurations
COPY apps/backend/tsconfig*.json ./apps/backend/
COPY apps/backend/nest-cli.json ./apps/backend/
COPY apps/backend/src ./apps/backend/src

# Generate Prisma Client
RUN cd apps/backend && npx prisma generate --schema=./prisma/schema.prisma || npx prisma generate --schema=/app/prisma/schema.prisma

# Build NestJS application
RUN npm run build --workspace=@setu/backend

# Stage 2: Production Runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3500

# Install runtime dependencies for Prisma and Healthchecks
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl wget ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Ensure uploads directory exists and is owned by node user
RUN mkdir -p /app/apps/backend/uploads && chown -R node:node /app

# Create non-root node user for container security
USER node

# Copy built application, generated Prisma client, and production dependencies
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --chown=node:node --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --chown=node:node --from=builder /app/package.json ./package.json

WORKDIR /app/apps/backend

EXPOSE 3500

# Health check for Azure Container Apps
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3500/api/v1/health || exit 1

CMD ["node", "dist/main"]

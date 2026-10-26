# ==============================================================================
# MESHVI BACKEND PRODUCTION DOCKERFILE
# Multi-stage optimized build for NestJS & Prisma
# ==============================================================================

# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies (OpenSSL required for Prisma)
RUN apk add --no-cache openssl python3 make g++

# Copy root workspace configurations
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/mobile/package*.json ./apps/mobile/

# Install dependencies for the backend workspace
RUN npm ci

# Copy Prisma schema and backend source code
COPY apps/backend/prisma ./apps/backend/prisma
COPY apps/backend/tsconfig*.json ./apps/backend/
COPY apps/backend/nest-cli.json ./apps/backend/
COPY apps/backend/src ./apps/backend/src

# Generate Prisma Client
RUN cd apps/backend && npx prisma generate

# Build NestJS application
RUN npm run build --workspace=@setu/backend

# Stage 2: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3500

# Install runtime dependencies for Prisma
RUN apk add --no-cache openssl

# Create non-root node user for container security
USER node

# Copy built application and production dependencies
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --chown=node:node --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --chown=node:node --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --chown=node:node --from=builder /app/apps/backend/package.json ./apps/backend/package.json

WORKDIR /app/apps/backend

EXPOSE 3500

# Health check for Azure App Service & Container Apps
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider https://setu-backend.onrender.com/api/v1/health || exit 1

CMD ["node", "dist/main"]

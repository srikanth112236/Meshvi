# ==============================================================================
# MESHVI FRONTEND PRODUCTION DOCKERFILE
# Multi-stage build for Vite SPA & Nginx
# ==============================================================================

# Stage 1: Build Vite React App
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/
COPY apps/mobile/package*.json ./apps/mobile/

# Install dependencies
RUN npm ci

# Copy frontend source
COPY apps/frontend ./apps/frontend

# Build for production with production API URL
ARG VITE_API_URL=https://api.projectsetu.org/api/v1
ARG VITE_GOOGLE_CLIENT_ID=1063250494735-h91upf3htdi4ms53aukttj9lgdenj5ia.apps.googleusercontent.com

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build --workspace=@setu/frontend

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine AS runner

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing & security headers
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

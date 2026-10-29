#!/usr/bin/env bash
# ==============================================================================
# MESHVI PLATFORM - AZURE BACKEND WORKLOAD DEPLOYMENT
# Subdomain: api.meshvi.org
# Technology: NestJS + Prisma ORM on Azure Container Apps
# ==============================================================================
set -euo pipefail

echo "========================================================================"
echo "  MESHVI: 02 - BUILD & DEPLOY BACKEND WORKLOAD (api.meshvi.org)"
echo "========================================================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# Load saved infrastructure variables if available
ENV_FILE="$SCRIPT_DIR/.azure-env"
if [ -f "$ENV_FILE" ]; then
  # shellcheck source=/dev/null
  source "$ENV_FILE"
fi

RESOURCE_GROUP="${RESOURCE_GROUP:-rg-meshvi-prod}"
ACR_NAME="${ACR_NAME:-acrmeshvi}"
CONTAINERAPPS_ENV="${CONTAINERAPPS_ENV:-cae-meshvi-prod}"
BACKEND_APP_NAME="${BACKEND_APP_NAME:-meshvi-backend}"
API_DOMAIN="${API_DOMAIN:-api.meshvi.org}"
FRONTEND_URL="${FRONTEND_URL:-https://meshvi.org}"

# Prompt for ACR and RG if not already loaded
read -rp "Resource Group [$RESOURCE_GROUP]: " INPUT_RG
RESOURCE_GROUP="${INPUT_RG:-$RESOURCE_GROUP}"

read -rp "Container Registry (ACR) Name [$ACR_NAME]: " INPUT_ACR
ACR_NAME="${INPUT_ACR:-$ACR_NAME}"

read -rp "Container Apps Environment [$CONTAINERAPPS_ENV]: " INPUT_CAE
CONTAINERAPPS_ENV="${INPUT_CAE:-$CONTAINERAPPS_ENV}"

# Prompt for database connection string (required by Prisma)
echo ""
echo "--- Backend Database & Secrets Configuration ---"
DEFAULT_DB="${DATABASE_URL:-}"
if [ -z "$DEFAULT_DB" ]; then
  echo "Enter your PostgreSQL connection URL (Azure Database for PostgreSQL, Supabase, Neon, or Render DB)."
  echo "Example: postgresql://username:password@your-db-host:5432/meshvi_db?schema=project_setu&sslmode=require"
  read -rp "DATABASE_URL: " DATABASE_URL
else
  read -rp "DATABASE_URL [$DEFAULT_DB]: " INPUT_DB
  DATABASE_URL="${INPUT_DB:-$DEFAULT_DB}"
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is required to deploy the backend."
  exit 1
fi

# JWT Secret
DEFAULT_JWT_SECRET="${JWT_SECRET:-meshvi_secret_jwt_prod_key_$(head -c 24 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9')}"
JWT_SECRET="${JWT_SECRET:-$DEFAULT_JWT_SECRET}"

# Google OAuth
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-1063250494735-h91upf3htdi4ms53aukttj9lgdenj5ia.apps.googleusercontent.com}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-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}"
GOOGLE_REDIRECT_URI="https://meshvi.org/auth/google/callback"

# AI Provider Key
GEMINI_API_KEY="${GEMINI_API_KEY:-AQ.Ab8RN6IAmJzU4OpT7BacXqbAG8XE23OuyUX4WJllOvxPopeMhg}"

echo ""
echo "==> Step 1: Building Backend Docker image via Azure ACR Cloud Build..."
echo "    Registry: $ACR_NAME"
echo "    Image:    meshvi-backend:latest"
az acr build \
  --registry "$ACR_NAME" \
  --image meshvi-backend:latest \
  --file apps/backend/Dockerfile \
  "$ROOT_DIR"

echo "==> Step 2: Retrieving ACR Admin credentials..."
ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer -o tsv)
ACR_USER=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query username -o tsv)
ACR_PASS=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "passwords[0].value" -o tsv)

echo "==> Step 3: Deploying Backend to Azure Container Apps ('$BACKEND_APP_NAME')..."
APP_IMAGE="$ACR_LOGIN_SERVER/meshvi-backend:latest"

ENV_VARS=(
  "NODE_ENV=production"
  "PORT=3500"
  "DATABASE_URL=$DATABASE_URL"
  "FRONTEND_URL=$FRONTEND_URL"
  "JWT_SECRET=$JWT_SECRET"
  "JWT_EXPIRES_IN=24h"
  "REFRESH_TOKEN_EXPIRES_IN=7d"
  "SESSION_SECRET=$JWT_SECRET"
  "GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET"
  "GOOGLE_REDIRECT_URI=$GOOGLE_REDIRECT_URI"
  "GEMINI_API_KEY=$GEMINI_API_KEY"
  "AI_PRIMARY_PROVIDER=gemini"
  "GEMINI_MODEL=gemini-2.5-flash"
)

if ! az containerapp show --name "$BACKEND_APP_NAME" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
  echo "    Creating new Container App '$BACKEND_APP_NAME'..."
  az containerapp create \
    --name "$BACKEND_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --environment "$CONTAINERAPPS_ENV" \
    --image "$APP_IMAGE" \
    --target-port 3500 \
    --ingress external \
    --registry-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USER" \
    --registry-password "$ACR_PASS" \
    --cpu 0.75 \
    --memory 1.5Gi \
    --min-replicas 1 \
    --max-replicas 5 \
    --env-vars "${ENV_VARS[@]}" \
    --output table
else
  echo "    Updating existing Container App '$BACKEND_APP_NAME'..."
  az containerapp update \
    --name "$BACKEND_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --image "$APP_IMAGE" \
    --set-env-vars "${ENV_VARS[@]}" \
    --output table
fi

# Fetch App Default FQDN
BACKEND_FQDN=$(az containerapp show --name "$BACKEND_APP_NAME" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)

echo ""
echo "========================================================================"
echo "✓ Backend API Successfully Deployed!"
echo "  Azure Default Endpoint: https://$BACKEND_FQDN/api/v1/health"
echo "  Target Custom Subdomain: https://$API_DOMAIN"
echo ""
echo "------------------------------------------------------------------------"
echo "  DNS CONFIGURATION FOR SUBDOMAIN ($API_DOMAIN):"
echo "------------------------------------------------------------------------"
echo "  Log in to your DNS provider (e.g. GoDaddy, Namecheap, Cloudflare) and add:"
echo ""
echo "  Record Type : CNAME"
echo "  Host / Name : api"
echo "  Points To   : $BACKEND_FQDN"
echo "  TTL         : Auto (or 300 / 3600)"
echo ""
echo "  Once the DNS record propagates, bind the domain with free managed SSL by running:"
echo "    az containerapp hostname add --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP --hostname $API_DOMAIN"
echo "    az containerapp hostname bind --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP --hostname $API_DOMAIN --environment $CONTAINERAPPS_ENV --validation-method CNAME"
echo "========================================================================"

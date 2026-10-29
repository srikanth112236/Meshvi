#!/usr/bin/env bash
# ==============================================================================
# MESHVI PLATFORM - AZURE FRONTEND WORKLOAD DEPLOYMENT
# Domain: meshvi.org & www.meshvi.org
# Technology: Vite React SPA + Nginx Alpine on Azure Container Apps
# ==============================================================================
set -euo pipefail

echo "========================================================================"
echo "  MESHVI: 03 - BUILD & DEPLOY FRONTEND WORKLOAD (meshvi.org)"
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
FRONTEND_APP_NAME="${FRONTEND_APP_NAME:-meshvi-frontend}"
DOMAIN="${DOMAIN:-meshvi.org}"
API_URL="${API_URL:-https://api.meshvi.org/api/v1}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-1063250494735-h91upf3htdi4ms53aukttj9lgdenj5ia.apps.googleusercontent.com}"

read -rp "Resource Group [$RESOURCE_GROUP]: " INPUT_RG
RESOURCE_GROUP="${INPUT_RG:-$RESOURCE_GROUP}"

read -rp "Container Registry (ACR) Name [$ACR_NAME]: " INPUT_ACR
ACR_NAME="${INPUT_ACR:-$ACR_NAME}"

read -rp "Container Apps Environment [$CONTAINERAPPS_ENV]: " INPUT_CAE
CONTAINERAPPS_ENV="${INPUT_CAE:-$CONTAINERAPPS_ENV}"

read -rp "Frontend Primary Domain [$DOMAIN]: " INPUT_DOMAIN
DOMAIN="${INPUT_DOMAIN:-$DOMAIN}"

read -rp "Backend API URL [$API_URL]: " INPUT_API
API_URL="${INPUT_API:-$API_URL}"

echo ""
echo "==> Step 1: Building Frontend Docker image via Azure ACR Cloud Build..."
echo "    Registry:     $ACR_NAME"
echo "    Image:        meshvi-frontend:latest"
echo "    VITE_API_URL: $API_URL"

az acr build \
  --registry "$ACR_NAME" \
  --image meshvi-frontend:latest \
  --build-arg "VITE_API_URL=$API_URL" \
  --build-arg "VITE_GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID" \
  --file apps/frontend/Dockerfile \
  "$ROOT_DIR"

echo "==> Step 2: Retrieving ACR Admin credentials..."
ACR_LOGIN_SERVER=$(az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query loginServer -o tsv)
ACR_USER=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query username -o tsv)
ACR_PASS=$(az acr credential show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" --query "passwords[0].value" -o tsv)

echo "==> Step 3: Deploying Frontend to Azure Container Apps ('$FRONTEND_APP_NAME')..."
APP_IMAGE="$ACR_LOGIN_SERVER/meshvi-frontend:latest"

if ! az containerapp show --name "$FRONTEND_APP_NAME" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
  echo "    Creating new Container App '$FRONTEND_APP_NAME'..."
  az containerapp create \
    --name "$FRONTEND_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --environment "$CONTAINERAPPS_ENV" \
    --image "$APP_IMAGE" \
    --target-port 80 \
    --ingress external \
    --registry-server "$ACR_LOGIN_SERVER" \
    --registry-username "$ACR_USER" \
    --registry-password "$ACR_PASS" \
    --cpu 0.5 \
    --memory 1.0Gi \
    --min-replicas 1 \
    --max-replicas 5 \
    --output table
else
  echo "    Updating existing Container App '$FRONTEND_APP_NAME'..."
  az containerapp update \
    --name "$FRONTEND_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --image "$APP_IMAGE" \
    --output table
fi

# Fetch App Default FQDN
FRONTEND_FQDN=$(az containerapp show --name "$FRONTEND_APP_NAME" --resource-group "$RESOURCE_GROUP" --query properties.configuration.ingress.fqdn -o tsv)
STATIC_IP=$(az containerapp env show --name "$CONTAINERAPPS_ENV" --resource-group "$RESOURCE_GROUP" --query properties.staticIp -o tsv 2>/dev/null || echo "")

echo ""
echo "========================================================================"
echo "✓ Frontend Web Application Successfully Deployed!"
echo "  Azure Default Endpoint: https://$FRONTEND_FQDN"
echo "  Target Custom Domain:   https://$DOMAIN (and https://www.$DOMAIN)"
echo ""
echo "------------------------------------------------------------------------"
echo "  DNS CONFIGURATION FOR DOMAIN ($DOMAIN & www.$DOMAIN):"
echo "------------------------------------------------------------------------"
echo "  In your DNS Provider (e.g. GoDaddy, Namecheap, Cloudflare), add:"
echo ""
echo "  [1] For www.$DOMAIN:"
echo "      Record Type : CNAME"
echo "      Host / Name : www"
echo "      Points To   : $FRONTEND_FQDN"
echo ""
if [ -n "$STATIC_IP" ]; then
echo "  [2] For Apex Domain ($DOMAIN):"
echo "      Record Type : A"
echo "      Host / Name : @"
echo "      Points To   : $STATIC_IP"
echo "      Record Type : TXT"
echo "      Host / Name : asuid"
echo "      Points To   : $FRONTEND_FQDN"
echo ""
fi
echo "  Once DNS propagates, bind your custom domains with free managed SSL:"
echo "    az containerapp hostname add --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP --hostname www.$DOMAIN"
echo "    az containerapp hostname bind --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP --hostname www.$DOMAIN --environment $CONTAINERAPPS_ENV --validation-method CNAME"
if [ -n "$STATIC_IP" ]; then
echo "    az containerapp hostname add --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP --hostname $DOMAIN"
echo "    az containerapp hostname bind --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP --hostname $DOMAIN --environment $CONTAINERAPPS_ENV --validation-method HTTP"
fi
echo "========================================================================"

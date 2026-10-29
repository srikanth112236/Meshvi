#!/usr/bin/env bash
# ==============================================================================
# MESHVI PLATFORM - AZURE STATIC WEB APPS (SWA) FRONTEND DEPLOYMENT (ALTERNATIVE)
# Domain: meshvi.org & www.meshvi.org
# Technology: Vite React SPA deployed on Azure Static Web Apps (Global Edge CDN)
# ==============================================================================
set -euo pipefail

echo "========================================================================"
echo "  MESHVI: 03-SWA - DEPLOY FRONTEND TO AZURE STATIC WEB APPS"
echo "========================================================================"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

ENV_FILE="$SCRIPT_DIR/.azure-env"
if [ -f "$ENV_FILE" ]; then
  # shellcheck source=/dev/null
  source "$ENV_FILE"
fi

RESOURCE_GROUP="${RESOURCE_GROUP:-rg-meshvi-prod}"
LOCATION="${LOCATION:-southeastasia}"
SWA_NAME="${SWA_NAME:-swa-meshvi-frontend}"
DOMAIN="${DOMAIN:-meshvi.org}"
API_URL="${API_URL:-https://api.meshvi.org/api/v1}"
REPO_URL="https://github.com/srikanth112236/Meshvi"
BRANCH="main"

read -rp "Resource Group [$RESOURCE_GROUP]: " INPUT_RG
RESOURCE_GROUP="${INPUT_RG:-$RESOURCE_GROUP}"

read -rp "Static Web App Name [$SWA_NAME]: " INPUT_SWA
SWA_NAME="${INPUT_SWA:-$SWA_NAME}"

read -rp "Azure Location [$LOCATION]: " INPUT_LOC
LOCATION="${INPUT_LOC:-$LOCATION}"

echo ""
echo "==> Ensuring Azure Static Web App '$SWA_NAME' exists in '$RESOURCE_GROUP'..."
if ! az staticwebapp show --name "$SWA_NAME" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
  az staticwebapp create \
    --name "$SWA_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --source "$REPO_URL" \
    --branch "$BRANCH" \
    --app-location "/" \
    --output-location "apps/frontend/dist" \
    --login-with-github \
    --output table
else
  echo "    Static Web App '$SWA_NAME' already exists."
fi

# Configure environment variables in SWA
echo "==> Setting Environment Variables in Static Web App..."
az staticwebapp appsettings set \
  --name "$SWA_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --setting-names \
    VITE_API_URL="$API_URL" \
    VITE_GOOGLE_CLIENT_ID="1063250494735-h91upf3htdi4ms53aukttj9lgdenj5ia.apps.googleusercontent.com" \
  --output table

SWA_DEFAULT_HOSTNAME=$(az staticwebapp show --name "$SWA_NAME" --resource-group "$RESOURCE_GROUP" --query defaultHostname -o tsv)

echo ""
echo "========================================================================"
echo "✓ Azure Static Web App Created!"
echo "  Default SWA URL: https://$SWA_DEFAULT_HOSTNAME"
echo "  Target Domain:   https://$DOMAIN"
echo ""
echo "  To bind your custom domain in Azure SWA:"
echo "    az staticwebapp hostname set --name $SWA_NAME --resource-group $RESOURCE_GROUP --hostname www.$DOMAIN"
echo "    az staticwebapp hostname set --name $SWA_NAME --resource-group $RESOURCE_GROUP --hostname $DOMAIN"
echo "========================================================================"

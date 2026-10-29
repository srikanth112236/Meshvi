#!/usr/bin/env bash
# ==============================================================================
# MESHVI PLATFORM - AZURE INFRASTRUCTURE SETUP
# Workload: Resource Group, Azure Container Registry (ACR), Container Apps Env
# ==============================================================================
set -euo pipefail

echo "========================================================================"
echo "  MESHVI: 01 - PROVISION CORE AZURE INFRASTRUCTURE"
echo "========================================================================"

# Default Configuration (Override by passing environment variables before running)
RESOURCE_GROUP="${RESOURCE_GROUP:-rg-meshvi-prod}"
LOCATION="${LOCATION:-southeastasia}"
CONTAINERAPPS_ENV="${CONTAINERAPPS_ENV:-cae-meshvi-prod}"

# ACR names must be globally unique, alphanumeric only, 5-50 chars
RANDOM_SUFFIX=$((10000 + RANDOM % 90000))
DEFAULT_ACR_NAME="acrmeshvi${RANDOM_SUFFIX}"
ACR_NAME="${ACR_NAME:-$DEFAULT_ACR_NAME}"

# Prompt for confirmation or customization (with safe defaults on Enter)
printf "Azure Resource Group [%s]: " "$RESOURCE_GROUP"
read -r INPUT_RG || true
RESOURCE_GROUP="${INPUT_RG:-$RESOURCE_GROUP}"

printf "Azure Region / Location [%s]: " "$LOCATION"
read -r INPUT_LOC || true
LOCATION="${INPUT_LOC:-$LOCATION}"

printf "Container Registry (ACR) Name [%s]: " "$ACR_NAME"
read -r INPUT_ACR || true
ACR_NAME="${INPUT_ACR:-$ACR_NAME}"

printf "Container Apps Environment Name [%s]: " "$CONTAINERAPPS_ENV"
read -r INPUT_CAE || true
CONTAINERAPPS_ENV="${INPUT_CAE:-$CONTAINERAPPS_ENV}"

echo ""
echo "Creating Infrastructure with the following settings:"
echo " - Resource Group:      $RESOURCE_GROUP"
echo " - Location:            $LOCATION"
echo " - Container Registry:  $ACR_NAME"
echo " - Container Apps Env:  $CONTAINERAPPS_ENV"
echo ""

# 1. Ensure required Azure CLI extensions are installed
echo "==> Registering / Updating Container Apps extension..."
az extension add --name containerapp --upgrade --yes >/dev/null 2>&1 || true
az provider register --namespace Microsoft.App --wait >/dev/null 2>&1 || true
az provider register --namespace Microsoft.OperationalInsights --wait >/dev/null 2>&1 || true

# 2. Create Resource Group
echo "==> Ensuring Resource Group '$RESOURCE_GROUP' exists in '$LOCATION'..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output table

# 3. Create Azure Container Registry (ACR)
echo "==> Ensuring Azure Container Registry '$ACR_NAME' exists..."
if ! az acr show --name "$ACR_NAME" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
  az acr create \
    --name "$ACR_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --sku Basic \
    --admin-enabled true \
    --output table
else
  echo "    ACR '$ACR_NAME' already exists."
fi

# Enable admin credentials to allow Container Apps pulling
echo "==> Enabling admin access on ACR..."
az acr update -n "$ACR_NAME" --admin-enabled true --output none

# 4. Create Azure Container Apps Environment
echo "==> Ensuring Container Apps Managed Environment '$CONTAINERAPPS_ENV' exists..."
if ! az containerapp env show --name "$CONTAINERAPPS_ENV" --resource-group "$RESOURCE_GROUP" >/dev/null 2>&1; then
  az containerapp env create \
    --name "$CONTAINERAPPS_ENV" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --output table
else
  echo "    Container Apps Environment '$CONTAINERAPPS_ENV' already exists."
fi

# 5. Save environment variables for subsequent deploy scripts
ENV_FILE="$(dirname "$0")/.azure-env"
cat <<EOF > "$ENV_FILE"
RESOURCE_GROUP="$RESOURCE_GROUP"
LOCATION="$LOCATION"
ACR_NAME="$ACR_NAME"
CONTAINERAPPS_ENV="$CONTAINERAPPS_ENV"
DOMAIN="meshvi.org"
API_DOMAIN="api.meshvi.org"
EOF

chmod 600 "$ENV_FILE" 2>/dev/null || true

echo ""
echo "========================================================================"
echo "✓ Azure Core Infrastructure Setup Completed Successfully!"
echo "  Configuration saved to: $ENV_FILE"
echo "  Next steps:"
echo "    - Run './azure/02-deploy-backend.sh' to deploy the API (api.meshvi.org)"
echo "    - Run './azure/03-deploy-frontend.sh' to deploy the Web (meshvi.org)"
echo "========================================================================"

#!/bin/bash
# ==============================================================================
# Microsoft for Startups Founders Hub - 5 Active Azure Workloads Setup Script
# Project: MESHVI (meshvi.org & api.meshvi.org)
# Unlocks Tier Acceleration (Up to $25,000 Azure Credits)
# ==============================================================================

set -e

RESOURCE_GROUP="meshvi-workloads-rg"
LOCATION="southeastasia"
APP_PLAN="meshvi-app-plan"
RAND=$((1000 + RANDOM % 9000))
WEB_APP="meshvi-app-$RAND"
STORAGE_ACC="meshvistore$RAND"
ACR_NAME="meshviacr$RAND"
VM_NAME="meshvi-compute-vm"
DB_SERVER="meshvi-pg-db-$RAND"

echo "========================================="
echo "Starting Deployment of 5 Active Azure Workloads (MESHVI)"
echo "========================================="

# 1. Login check
az account show --output none 2>/dev/null || az login

# Create Resource Group
echo -e "\n[+] Ensuring Resource Group: $RESOURCE_GROUP in $LOCATION..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output table

# ------------------------------------------------------------------------------
# WORKLOAD 1: Azure App Service (Frontend Host Workload)
# ------------------------------------------------------------------------------
echo -e "\n[1/5] Deploying Workload 1: Azure App Service (Linux B1 Plan)..."
EXISTING_PLAN=$(az appservice plan show --name $APP_PLAN --resource-group $RESOURCE_GROUP --query 'name' -o tsv 2>/dev/null || true)
if [ -z "$EXISTING_PLAN" ]; then
  az appservice plan create --name $APP_PLAN --resource-group $RESOURCE_GROUP --location $LOCATION --sku B1 --is-linux --output table
else
  echo "    [i] Reusing existing App Service Plan: $APP_PLAN"
fi

EXISTING_APP=$(az webapp list --resource-group $RESOURCE_GROUP --query '[0].name' -o tsv 2>/dev/null || true)
if [ -n "$EXISTING_APP" ]; then
  WEB_APP="$EXISTING_APP"
  echo "    [i] Reusing existing Web App: $WEB_APP"
else
  az webapp create --name $WEB_APP --resource-group $RESOURCE_GROUP --plan $APP_PLAN --output table
  az webapp config set --resource-group $RESOURCE_GROUP --name $WEB_APP --linux-fx-version "NODE|20-lts" --output none 2>/dev/null || true
  az webapp config set --resource-group $RESOURCE_GROUP --name $WEB_APP --startup-file "npx serve -s site -l 8080" --output none 2>/dev/null || true
fi
echo "[✓] Workload 1 Deployed: $WEB_APP.azurewebsites.net"

# ------------------------------------------------------------------------------
# WORKLOAD 2: Azure Storage Account (Blob Storage Workload)
# ------------------------------------------------------------------------------
echo -e "\n[2/5] Deploying Workload 2: Azure Blob Storage Account..."
EXISTING_STORAGE=$(az storage account list --resource-group $RESOURCE_GROUP --query '[0].name' -o tsv 2>/dev/null || true)
if [ -n "$EXISTING_STORAGE" ]; then
  STORAGE_ACC="$EXISTING_STORAGE"
  echo "    [i] Reusing existing Storage Account: $STORAGE_ACC"
else
  az storage account create --name $STORAGE_ACC --resource-group $RESOURCE_GROUP --location $LOCATION --sku Standard_LRS --kind StorageV2 --output table
fi
az storage container create --name "uploads" --account-name $STORAGE_ACC --public-access blob --auth-mode login --output none 2>/dev/null || true
echo "[✓] Workload 2 Deployed: Storage Account $STORAGE_ACC (Container: uploads)"

# ------------------------------------------------------------------------------
# WORKLOAD 3: Azure Container Registry (ACR Workload)
# ------------------------------------------------------------------------------
echo -e "\n[3/5] Deploying Workload 3: Azure Container Registry..."
EXISTING_ACR=$(az acr list --resource-group $RESOURCE_GROUP --query '[0].name' -o tsv 2>/dev/null || true)
if [ -n "$EXISTING_ACR" ]; then
  ACR_NAME="$EXISTING_ACR"
  echo "    [i] Reusing existing Container Registry: $ACR_NAME"
else
  az acr create --name $ACR_NAME --resource-group $RESOURCE_GROUP --sku Basic --admin-enabled true --output table
fi
echo "[✓] Workload 3 Deployed: Container Registry $ACR_NAME.azurecr.io"

# ------------------------------------------------------------------------------
# WORKLOAD 4: Azure Linux Virtual Machine (Compute Workload)
# ------------------------------------------------------------------------------
echo -e "\n[4/5] Deploying Workload 4: Azure Linux Compute VM..."
EXISTING_VM=$(az vm show --resource-group $RESOURCE_GROUP --name $VM_NAME --query 'name' -o tsv 2>/dev/null || true)

if [ -z "$EXISTING_VM" ]; then
  VM_SIZES=("Standard_B2s" "Standard_B1ms" "Standard_D2s_v3" "Standard_D2as_v4" "Standard_B2ms" "Standard_B1s")
  VM_CREATED=false

  for SIZE in "${VM_SIZES[@]}"; do
    echo "    Attempting VM deployment with size: $SIZE in $LOCATION..."
    if az vm create \
      --resource-group $RESOURCE_GROUP \
      --name $VM_NAME \
      --image Ubuntu2204 \
      --size $SIZE \
      --admin-username azureuser \
      --generate-ssh-keys \
      --public-ip-sku Standard 2>/dev/null; then
      echo "    [✓] Successfully provisioned VM ($SIZE)!"
      VM_CREATED=true
      break
    else
      echo "    [!] Size $SIZE not available in $LOCATION, trying next SKU..."
    fi
  done

  if [ "$VM_CREATED" = false ]; then
    echo "Failed to create Azure VM with available SKUs."
    exit 1
  fi
else
  echo "    [i] Reusing existing VM: $VM_NAME"
fi

echo "    Configuring Ports (80 HTTP, 443 HTTPS, 3500 Backend API)..."
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 80 --priority 1010 --output none 2>/dev/null || true
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 443 --priority 1020 --output none 2>/dev/null || true
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 3500 --priority 1030 --output none 2>/dev/null || true

VM_IP=$(az vm list-ip-addresses --resource-group $RESOURCE_GROUP --name $VM_NAME --query '[0].virtualMachine.network.publicIpAddresses[0].ipAddress' -o tsv | tr -d '\r\n')
echo "[✓] Workload 4 Deployed: Linux Compute VM $VM_NAME (Public IP: $VM_IP)"

# ------------------------------------------------------------------------------
# WORKLOAD 5: Azure Database for PostgreSQL (Database Workload)
# ------------------------------------------------------------------------------
echo -e "\n[5/5] Deploying Workload 5: Azure PostgreSQL Flexible Server..."
EXISTING_PG=$(az postgres flexible-server list --resource-group $RESOURCE_GROUP --query '[0].name' -o tsv 2>/dev/null || true)

if [ -n "$EXISTING_PG" ]; then
  DB_SERVER="$EXISTING_PG"
  echo "    [i] Reusing existing PostgreSQL Server: $DB_SERVER"
else
  az postgres flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $DB_SERVER \
    --location $LOCATION \
    --admin-user meshviadmin \
    --admin-password "MeshviSecurePass2026!" \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --public-access All \
    --output table
fi
echo "[✓] Workload 5 Deployed: PostgreSQL Database Server $DB_SERVER"

echo "========================================="
echo "SUCCESS! All 5 Active Azure Workloads are Deployed & Active"
echo "========================================="
echo "Resource Group: $RESOURCE_GROUP"
echo "Workload 1 (App Service):     $WEB_APP.azurewebsites.net"
echo "Workload 2 (Blob Storage):    $STORAGE_ACC"
echo "Workload 3 (ACR Registry):    $ACR_NAME.azurecr.io"
echo "Workload 4 (Linux Compute VM):$VM_NAME (Public IP: $VM_IP)"
echo "Workload 5 (PostgreSQL DB):   $DB_SERVER"
echo -e "\nDatabase Connection String:"
echo "postgresql://meshviadmin:MeshviSecurePass2026!@${DB_SERVER}.postgres.database.azure.com/postgres?sslmode=require&schema=project_setu"
echo -e "\nNext Step: Run './deploy-backend-vm.sh' to deploy the Meshvi Backend to the VM!"

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
WEB_APP="meshvi-frontend-app"
RAND=$((1000 + RANDOM % 9000))
STORAGE_ACC="meshvistore$RAND"
ACR_NAME="meshviacr$RAND"
VM_NAME="meshvi-compute-vm"
DB_SERVER="meshvi-pg-db-$RAND"

echo "========================================="
echo "Starting Deployment of 5 Active Azure Workloads (MESHVI)"
echo "========================================="

# 1. Login check
az account show --output none || az login

# Create Resource Group
echo -e "\n[+] Creating Resource Group: $RESOURCE_GROUP in $LOCATION..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output table

# ------------------------------------------------------------------------------
# WORKLOAD 1: Azure App Service (Frontend Host Workload)
# ------------------------------------------------------------------------------
echo -e "\n[1/5] Deploying Workload 1: Azure App Service (Linux B1 Plan)..."
az appservice plan create --name $APP_PLAN --resource-group $RESOURCE_GROUP --location $LOCATION --sku B1 --is-linux --output table
az webapp create --name $WEB_APP --resource-group $RESOURCE_GROUP --plan $APP_PLAN --runtime "NODE:20-lts" --output table
az webapp config set --resource-group $RESOURCE_GROUP --name $WEB_APP --startup-file "npx serve -s site -l 8080" --output none
echo "[✓] Workload 1 Deployed: $WEB_APP.azurewebsites.net"

# ------------------------------------------------------------------------------
# WORKLOAD 2: Azure Storage Account (Blob Storage Workload)
# ------------------------------------------------------------------------------
echo -e "\n[2/5] Deploying Workload 2: Azure Blob Storage Account..."
az storage account create --name $STORAGE_ACC --resource-group $RESOURCE_GROUP --location $LOCATION --sku Standard_LRS --kind StorageV2 --output table
az storage container create --name "uploads" --account-name $STORAGE_ACC --public-access blob --output none
echo "[✓] Workload 2 Deployed: Storage Account $STORAGE_ACC"

# ------------------------------------------------------------------------------
# WORKLOAD 3: Azure Container Registry (ACR Workload)
# ------------------------------------------------------------------------------
echo -e "\n[3/5] Deploying Workload 3: Azure Container Registry..."
az acr create --name $ACR_NAME --resource-group $RESOURCE_GROUP --sku Basic --admin-enabled true --output table
echo "[✓] Workload 3 Deployed: Container Registry $ACR_NAME.azurecr.io"

# ------------------------------------------------------------------------------
# WORKLOAD 4: Azure Linux Virtual Machine (Compute Workload)
# ------------------------------------------------------------------------------
echo -e "\n[4/5] Deploying Workload 4: Azure Linux Compute VM (Standard_B1s)..."
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard \
  --output table

az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 80 --priority 1010 --output none
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 443 --priority 1020 --output none
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 3500 --priority 1030 --output none

VM_IP=$(az vm list-ip-addresses --resource-group $RESOURCE_GROUP --name $VM_NAME --query '[0].virtualMachine.network.publicIpAddresses[0].ipAddress' -o tsv)
echo "[✓] Workload 4 Deployed: Linux Compute VM $VM_NAME (Public IP: $VM_IP)"

# ------------------------------------------------------------------------------
# WORKLOAD 5: Azure Database for PostgreSQL (Database Workload)
# ------------------------------------------------------------------------------
echo -e "\n[5/5] Deploying Workload 5: Azure PostgreSQL Flexible Server..."
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

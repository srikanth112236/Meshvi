# ==============================================================================
# Microsoft for Startups Founders Hub - 5 Active Azure Workloads Setup Script
# Project: MESHVI (meshvi.org & api.meshvi.org)
# Unlocks Tier Acceleration (Up to $25,000 Azure Credits)
# ==============================================================================

param (
    [string]$ResourceGroup = "meshvi-workloads-rg",
    [string]$Location = "southeastasia"
)

$ErrorActionPreference = "Stop"

$Rand = Get-Random -Minimum 1000 -Maximum 9999
$AppServicePlan = "meshvi-app-plan"
$WebAppName = "meshvi-frontend-app"
$StorageAccountName = "meshvistore$Rand"
$ContainerRegistryName = "meshviacr$Rand"
$VmName = "meshvi-compute-vm"
$DbServerName = "meshvi-pg-db-$Rand"

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Starting Deployment of 5 Active Azure Workloads (MESHVI)" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# 1. Login check
az account show --output none 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Logging into Azure..." -ForegroundColor Yellow
    az login
}

# Create Resource Group
Write-Host "`n[+] Creating Resource Group: $ResourceGroup in $Location..." -ForegroundColor Cyan
az group create --name $ResourceGroup --location $Location --output table

# ------------------------------------------------------------------------------
# WORKLOAD 1: Azure App Service (Frontend Host Workload)
# ------------------------------------------------------------------------------
Write-Host "`n[1/5] Deploying Workload 1: Azure App Service (Linux B1 Plan)..." -ForegroundColor Yellow
az appservice plan create --name $AppServicePlan --resource-group $ResourceGroup --location $Location --sku B1 --is-linux --output table
az webapp create --name $WebAppName --resource-group $ResourceGroup --plan $AppServicePlan --runtime "NODE:20-lts" --output table
az webapp config set --resource-group $ResourceGroup --name $WebAppName --startup-file "npx serve -s site -l 8080" --output none
Write-Host "[✓] Workload 1 Deployed: $WebAppName.azurewebsites.net" -ForegroundColor Green

# ------------------------------------------------------------------------------
# WORKLOAD 2: Azure Storage Account (Blob Storage Workload)
# ------------------------------------------------------------------------------
Write-Host "`n[2/5] Deploying Workload 2: Azure Blob Storage Account..." -ForegroundColor Yellow
az storage account create --name $StorageAccountName --resource-group $ResourceGroup --location $Location --sku Standard_LRS --kind StorageV2 --output table
az storage container create --name "uploads" --account-name $StorageAccountName --public-access blob --output none
Write-Host "[✓] Workload 2 Deployed: Storage Account $StorageAccountName (Container: uploads)" -ForegroundColor Green

# ------------------------------------------------------------------------------
# WORKLOAD 3: Azure Container Registry (ACR Workload)
# ------------------------------------------------------------------------------
Write-Host "`n[3/5] Deploying Workload 3: Azure Container Registry..." -ForegroundColor Yellow
az acr create --name $ContainerRegistryName --resource-group $ResourceGroup --sku Basic --admin-enabled true --output table
Write-Host "[✓] Workload 3 Deployed: Container Registry $ContainerRegistryName.azurecr.io" -ForegroundColor Green

# ------------------------------------------------------------------------------
# WORKLOAD 4: Azure Linux Virtual Machine (Compute Workload)
# ------------------------------------------------------------------------------
Write-Host "`n[4/5] Deploying Workload 4: Azure Linux Compute VM (Standard_B1s)..." -ForegroundColor Yellow
az vm create `
  --resource-group $ResourceGroup `
  --name $VmName `
  --image Ubuntu2204 `
  --size Standard_B1s `
  --admin-username azureuser `
  --generate-ssh-keys `
  --public-ip-sku Standard `
  --output table

Write-Host "    Opening Ports (22 SSH, 80 HTTP, 443 HTTPS, 3500 Backend API)..." -ForegroundColor Cyan
az vm open-port --resource-group $ResourceGroup --name $VmName --port 80 --priority 1010 --output none
az vm open-port --resource-group $ResourceGroup --name $VmName --port 443 --priority 1020 --output none
az vm open-port --resource-group $ResourceGroup --name $VmName --port 3500 --priority 1030 --output none

$VmIp = (az vm list-ip-addresses --resource-group $ResourceGroup --name $VmName --query '[0].virtualMachine.network.publicIpAddresses[0].ipAddress' -o tsv).Trim()
Write-Host "[✓] Workload 4 Deployed: Linux Compute VM $VmName (Public IP: $VmIp)" -ForegroundColor Green

# ------------------------------------------------------------------------------
# WORKLOAD 5: Azure Database for PostgreSQL (Database Workload)
# ------------------------------------------------------------------------------
Write-Host "`n[5/5] Deploying Workload 5: Azure PostgreSQL Flexible Server..." -ForegroundColor Yellow
az postgres flexible-server create `
  --resource-group $ResourceGroup `
  --name $DbServerName `
  --location $Location `
  --admin-user meshviadmin `
  --admin-password "MeshviSecurePass2026!" `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --public-access All `
  --output table
Write-Host "[✓] Workload 5 Deployed: PostgreSQL Database Server $DbServerName" -ForegroundColor Green

# ------------------------------------------------------------------------------
# SUMMARY
# ------------------------------------------------------------------------------
Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "SUCCESS! All 5 Active Azure Workloads are Deployed & Active" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Resource Group: $ResourceGroup"
Write-Host "Workload 1 (App Service):     $WebAppName.azurewebsites.net"
Write-Host "Workload 2 (Blob Storage):    $StorageAccountName"
Write-Host "Workload 3 (ACR Registry):    $ContainerRegistryName.azurecr.io"
Write-Host "Workload 4 (Linux Compute VM):$VmName (Public IP: $VmIp)"
Write-Host "Workload 5 (PostgreSQL DB):   $DbServerName"
Write-Host "`nDatabase Connection String:" -ForegroundColor Cyan
Write-Host "postgresql://meshviadmin:MeshviSecurePass2026!@${DbServerName}.postgres.database.azure.com/postgres?sslmode=require&schema=project_setu"
Write-Host "`nNext Step: Run '.\deploy-backend-vm.ps1' to deploy the Meshvi Backend to the VM!" -ForegroundColor Yellow

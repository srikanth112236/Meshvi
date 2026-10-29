# ==============================================================================
# MESHVI PLATFORM - AZURE INFRASTRUCTURE SETUP (POWERSHELL)
# Workload: Resource Group, Azure Container Registry (ACR), Container Apps Env
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  MESHVI: 01 - PROVISION CORE AZURE INFRASTRUCTURE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

# Default Configuration
$ResourceGroup = "rg-meshvi-prod"
$Location = "southeastasia"
$ContainerAppsEnv = "cae-meshvi-prod"
$RandomNum = Get-Random -Minimum 10000 -Maximum 99999
$AcrName = "acrmeshvi$RandomNum"

$inRg = Read-Host "Azure Resource Group [$ResourceGroup]"
if ($inRg) { $ResourceGroup = $inRg }

$inLoc = Read-Host "Azure Region / Location [$Location]"
if ($inLoc) { $Location = $inLoc }

$inAcr = Read-Host "Container Registry (ACR) Name [$AcrName]"
if ($inAcr) { $AcrName = $inAcr }

$inCae = Read-Host "Container Apps Environment Name [$ContainerAppsEnv]"
if ($inCae) { $ContainerAppsEnv = $inCae }

Write-Host ""
Write-Host "Creating Infrastructure with the following settings:" -ForegroundColor Yellow
Write-Host " - Resource Group:     $ResourceGroup"
Write-Host " - Location:           $Location"
Write-Host " - Container Registry: $AcrName"
Write-Host " - Container Apps Env: $ContainerAppsEnv"
Write-Host ""

# 1. Ensure required Azure CLI extensions are installed
Write-Host "==> Registering / Updating Container Apps extension..." -ForegroundColor Yellow
az extension add --name containerapp --upgrade --yes 2>$null | Out-Null
az provider register --namespace Microsoft.App --wait 2>$null | Out-Null
az provider register --namespace Microsoft.OperationalInsights --wait 2>$null | Out-Null

# 2. Create Resource Group
Write-Host "==> Ensuring Resource Group '$ResourceGroup' exists in '$Location'..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location --output table

# 3. Create Azure Container Registry (ACR)
Write-Host "==> Ensuring Azure Container Registry '$AcrName' exists..." -ForegroundColor Yellow
$acrExists = az acr show --name $AcrName --resource-group $ResourceGroup 2>$null
if (-not $acrExists) {
    az acr create --name $AcrName --resource-group $ResourceGroup --sku Basic --admin-enabled true --output table
} else {
    Write-Host "    ACR '$AcrName' already exists." -ForegroundColor Green
}

# Enable admin credentials on ACR
az acr update -n $AcrName --admin-enabled true --output none

# 4. Create Azure Container Apps Environment
Write-Host "==> Ensuring Container Apps Managed Environment '$ContainerAppsEnv' exists..." -ForegroundColor Yellow
$caeExists = az containerapp env show --name $ContainerAppsEnv --resource-group $ResourceGroup 2>$null
if (-not $caeExists) {
    az containerapp env create --name $ContainerAppsEnv --resource-group $ResourceGroup --location $Location --output table
} else {
    Write-Host "    Container Apps Environment '$ContainerAppsEnv' already exists." -ForegroundColor Green
}

# 5. Save configuration
$EnvFile = Join-Path $PSScriptRoot ".azure-env.json"
@{
    ResourceGroup    = $ResourceGroup
    Location         = $Location
    AcrName          = $AcrName
    ContainerAppsEnv = $ContainerAppsEnv
    Domain           = "meshvi.org"
    ApiDomain        = "api.meshvi.org"
} | ConvertTo-Json | Set-Content $EnvFile

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "✓ Azure Core Infrastructure Setup Completed Successfully!" -ForegroundColor Green
Write-Host "  Next steps:"
Write-Host "    - Run './azure/02-deploy-backend.ps1' to deploy the API (api.meshvi.org)"
Write-Host "    - Run './azure/03-deploy-frontend.ps1' to deploy the Web (meshvi.org)"
Write-Host "========================================================================" -ForegroundColor Green

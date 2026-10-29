# ==============================================================================
# MESHVI PLATFORM - AZURE FRONTEND DEPLOYMENT (POWERSHELL)
# Domain: meshvi.org & www.meshvi.org
# Technology: Vite React SPA + Nginx Alpine on Azure Container Apps
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  MESHVI: 03 - BUILD & DEPLOY FRONTEND WORKLOAD (meshvi.org)" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

$RootDir = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $RootDir

$ResourceGroup = "rg-meshvi-prod"
$AcrName = "acrmeshvi"
$ContainerAppsEnv = "cae-meshvi-prod"
$FrontendAppName = "meshvi-frontend"
$Domain = "meshvi.org"
$ApiUrl = "https://api.meshvi.org/api/v1"
$GoogleClientId = $env:VITE_GOOGLE_CLIENT_ID

# Load saved configuration if present
$EnvFile = Join-Path $PSScriptRoot ".azure-env.json"
if (Test-Path $EnvFile) {
    $cfg = Get-Content $EnvFile | ConvertFrom-Json
    if ($cfg.ResourceGroup) { $ResourceGroup = $cfg.ResourceGroup }
    if ($cfg.AcrName) { $AcrName = $cfg.AcrName }
    if ($cfg.ContainerAppsEnv) { $ContainerAppsEnv = $cfg.ContainerAppsEnv }
}

$inRg = Read-Host "Resource Group [$ResourceGroup]"
if ($inRg) { $ResourceGroup = $inRg }

$inAcr = Read-Host "Container Registry (ACR) Name [$AcrName]"
if ($inAcr) { $AcrName = $inAcr }

$inCae = Read-Host "Container Apps Environment [$ContainerAppsEnv]"
if ($inCae) { $ContainerAppsEnv = $inCae }

$inDomain = Read-Host "Frontend Primary Domain [$Domain]"
if ($inDomain) { $Domain = $inDomain }

$inApi = Read-Host "Backend API URL [$ApiUrl]"
if ($inApi) { $ApiUrl = $inApi }

Write-Host ""
Write-Host "==> Step 1: Building Frontend Docker image via Azure ACR Cloud Build..." -ForegroundColor Yellow
az acr build `
    --registry $AcrName `
    --image meshvi-frontend:latest `
    --build-arg "VITE_API_URL=$ApiUrl" `
    --build-arg "VITE_GOOGLE_CLIENT_ID=$GoogleClientId" `
    --file apps/frontend/Dockerfile .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker build failed in Azure ACR. Please review the build error above."
    exit 1
}

Write-Host "==> Step 2: Retrieving ACR Admin credentials..." -ForegroundColor Yellow
$AcrLoginServer = (az acr show --name $AcrName --resource-group $ResourceGroup --query loginServer -o tsv).Trim()
$AcrUser = (az acr credential show --name $AcrName --resource-group $ResourceGroup --query username -o tsv).Trim()
$AcrPass = (az acr credential show --name $AcrName --resource-group $ResourceGroup --query "passwords[0].value" -o tsv).Trim()

Write-Host "==> Step 3: Deploying Frontend to Azure Container Apps ('$FrontendAppName')..." -ForegroundColor Yellow
$AppImage = "$AcrLoginServer/meshvi-frontend:latest"

$frontendExists = az containerapp show --name $FrontendAppName --resource-group $ResourceGroup 2>$null
if (-not $frontendExists) {
    az containerapp create `
        --name $FrontendAppName `
        --resource-group $ResourceGroup `
        --environment $ContainerAppsEnv `
        --image $AppImage `
        --target-port 80 `
        --ingress external `
        --registry-server $AcrLoginServer `
        --registry-username $AcrUser `
        --registry-password $AcrPass `
        --cpu 0.5 `
        --memory 1.0Gi `
        --min-replicas 1 `
        --max-replicas 5 `
        --output table
} else {
    az containerapp update `
        --name $FrontendAppName `
        --resource-group $ResourceGroup `
        --image $AppImage `
        --output table
}

$FrontendFqdn = (az containerapp show --name $FrontendAppName --resource-group $ResourceGroup --query properties.configuration.ingress.fqdn -o tsv).Trim()
$StaticIp = (az containerapp env show --name $ContainerAppsEnv --resource-group $ResourceGroup --query properties.staticIp -o tsv 2>$null)

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "✓ Frontend Web Application Successfully Deployed!" -ForegroundColor Green
Write-Host "  Azure Default Endpoint: https://$FrontendFqdn"
Write-Host "  Target Custom Domain:   https://$Domain (and https://www.$Domain)"
Write-Host ""
Write-Host "  DNS CONFIGURATION FOR DOMAIN ($Domain & www.$Domain):" -ForegroundColor Yellow
Write-Host "    [1] For www.$Domain:"
Write-Host "        Record Type : CNAME"
Write-Host "        Host / Name : www"
Write-Host "        Points To   : $FrontendFqdn"
if ($StaticIp) {
    Write-Host ""
    Write-Host "    [2] For Apex Domain ($Domain):"
    Write-Host "        Record Type : A"
    Write-Host "        Host / Name : @"
    Write-Host "        Points To   : $StaticIp"
    Write-Host "        Record Type : TXT"
    Write-Host "        Host / Name : asuid"
    Write-Host "        Points To   : $FrontendFqdn"
}
Write-Host ""
Write-Host "  Once DNS propagates, bind custom domains with free managed SSL:" -ForegroundColor Yellow
Write-Host "    az containerapp hostname add --name $FrontendAppName --resource-group $ResourceGroup --hostname www.$Domain"
Write-Host "    az containerapp hostname bind --name $FrontendAppName --resource-group $ResourceGroup --hostname www.$Domain --environment $ContainerAppsEnv --validation-method CNAME"
Write-Host "========================================================================" -ForegroundColor Green

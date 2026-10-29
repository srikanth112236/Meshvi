# ==============================================================================
# MESHVI PLATFORM - AZURE BACKEND DEPLOYMENT (POWERSHELL)
# Subdomain: api.meshvi.org
# Technology: NestJS + Prisma ORM on Azure Container Apps
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  MESHVI: 02 - BUILD & DEPLOY BACKEND WORKLOAD (api.meshvi.org)" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

$RootDir = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $RootDir

$ResourceGroup = "rg-meshvi-prod"
$AcrName = "acrmeshvi"
$ContainerAppsEnv = "cae-meshvi-prod"
$BackendAppName = "meshvi-backend"
$ApiDomain = "api.meshvi.org"
$FrontendUrl = "https://meshvi.org"

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

Write-Host ""
Write-Host "--- Backend Database & Secrets Configuration ---" -ForegroundColor Yellow
$DatabaseUrl = $env:DATABASE_URL
if (-not $DatabaseUrl) {
    Write-Host "Enter your PostgreSQL connection URL (e.g. Supabase, Azure PostgreSQL, Neon):"
    $DatabaseUrl = Read-Host "DATABASE_URL"
} else {
    $inDb = Read-Host "DATABASE_URL [$DatabaseUrl]"
    if ($inDb) { $DatabaseUrl = $inDb }
}

if (-not $DatabaseUrl) {
    Write-Error "DATABASE_URL is required to deploy the backend."
    exit 1
}

$JwtSecret = $env:JWT_SECRET
if (-not $JwtSecret) {
    $JwtSecret = "meshvi_secret_jwt_prod_key_$(Get-Date -Format 'yyyyMMddHHmmss')_$((Get-Random))"
}
$GoogleClientId = $env:GOOGLE_CLIENT_ID
$GoogleClientSecret = $env:GOOGLE_CLIENT_SECRET
$GoogleRedirectUri = "https://meshvi.org/auth/google/callback"
$GeminiApiKey = $env:GEMINI_API_KEY

Write-Host ""
Write-Host "==> Step 1: Building Backend Docker image via Azure ACR Cloud Build..." -ForegroundColor Yellow
az acr build --registry $AcrName --image meshvi-backend:latest --file apps/backend/Dockerfile .

Write-Host "==> Step 2: Retrieving ACR Admin credentials..." -ForegroundColor Yellow
$AcrLoginServer = (az acr show --name $AcrName --resource-group $ResourceGroup --query loginServer -o tsv).Trim()
$AcrUser = (az acr credential show --name $AcrName --resource-group $ResourceGroup --query username -o tsv).Trim()
$AcrPass = (az acr credential show --name $AcrName --resource-group $ResourceGroup --query "passwords[0].value" -o tsv).Trim()

Write-Host "==> Step 3: Deploying Backend to Azure Container Apps ('$BackendAppName')..." -ForegroundColor Yellow
$AppImage = "$AcrLoginServer/meshvi-backend:latest"

$envVars = @(
    "NODE_ENV=production",
    "PORT=3500",
    "DATABASE_URL=$DatabaseUrl",
    "FRONTEND_URL=$FrontendUrl",
    "JWT_SECRET=$JwtSecret",
    "JWT_EXPIRES_IN=24h",
    "REFRESH_TOKEN_EXPIRES_IN=7d",
    "SESSION_SECRET=$JwtSecret",
    "GOOGLE_CLIENT_ID=$GoogleClientId",
    "GOOGLE_CLIENT_SECRET=$GoogleClientSecret",
    "GOOGLE_REDIRECT_URI=$GoogleRedirectUri",
    "GEMINI_API_KEY=$GeminiApiKey",
    "AI_PRIMARY_PROVIDER=gemini",
    "GEMINI_MODEL=gemini-2.5-flash"
)

$backendExists = az containerapp show --name $BackendAppName --resource-group $ResourceGroup 2>$null
if (-not $backendExists) {
    az containerapp create `
        --name $BackendAppName `
        --resource-group $ResourceGroup `
        --environment $ContainerAppsEnv `
        --image $AppImage `
        --target-port 3500 `
        --ingress external `
        --registry-server $AcrLoginServer `
        --registry-username $AcrUser `
        --registry-password $AcrPass `
        --cpu 0.75 `
        --memory 1.5Gi `
        --min-replicas 1 `
        --max-replicas 5 `
        --env-vars $envVars `
        --output table
} else {
    az containerapp update `
        --name $BackendAppName `
        --resource-group $ResourceGroup `
        --image $AppImage `
        --set-env-vars $envVars `
        --output table
}

$BackendFqdn = (az containerapp show --name $BackendAppName --resource-group $ResourceGroup --query properties.configuration.ingress.fqdn -o tsv).Trim()

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "✓ Backend API Successfully Deployed!" -ForegroundColor Green
Write-Host "  Azure Default Endpoint: https://$BackendFqdn/api/v1/health"
Write-Host "  Target Custom Subdomain: https://$ApiDomain"
Write-Host ""
Write-Host "  DNS CONFIGURATION FOR SUBDOMAIN ($ApiDomain):" -ForegroundColor Yellow
Write-Host "    Record Type : CNAME"
Write-Host "    Host / Name : api"
Write-Host "    Points To   : $BackendFqdn"
Write-Host ""
Write-Host "  Once DNS propagates, bind domain with free SSL:" -ForegroundColor Yellow
Write-Host "    az containerapp hostname add --name $BackendAppName --resource-group $ResourceGroup --hostname $ApiDomain"
Write-Host "    az containerapp hostname bind --name $BackendAppName --resource-group $ResourceGroup --hostname $ApiDomain --environment $ContainerAppsEnv --validation-method CNAME"
Write-Host "========================================================================" -ForegroundColor Green

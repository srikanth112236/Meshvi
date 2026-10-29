# ==============================================================================
# MESHVI PLATFORM - COMPLETE AZURE DEPLOYMENT (POWERSHELL ORCHESTRATOR)
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "      MESHVI PLATFORM - FULL AUTOMATED AZURE CLOUD DEPLOYMENT" -ForegroundColor Cyan
Write-Host "      Domain: meshvi.org | Subdomain: api.meshvi.org" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This wizard will run the following deployment stages:"
Write-Host "  [1/3] Provision Core Infrastructure (Resource Group, ACR, Container Apps Env)"
Write-Host "  [2/3] Build & Deploy Backend API (api.meshvi.org on port 3500)"
Write-Host "  [3/3] Build & Deploy Frontend Web App (meshvi.org on port 80)"
Write-Host ""

$confirm = Read-Host "Do you want to proceed with full Azure deployment? (y/N)"
if ($confirm -notmatch '^[Yy]$') {
    Write-Host "Deployment aborted."
    exit 0
}

Write-Host ""
Write-Host ">>> STEP 1: Setting up Azure Infrastructure..." -ForegroundColor Cyan
& (Join-Path $PSScriptRoot "01-setup-infra.ps1")

Write-Host ""
Write-Host ">>> STEP 2: Building & Deploying Backend API..." -ForegroundColor Cyan
& (Join-Path $PSScriptRoot "02-deploy-backend.ps1")

Write-Host ""
Write-Host ">>> STEP 3: Building & Deploying Frontend Web Application..." -ForegroundColor Cyan
& (Join-Path $PSScriptRoot "03-deploy-frontend.ps1")

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "🎉 ALL WORKLOADS DEPLOYED TO AZURE SUCCESSFULLY!" -ForegroundColor Green
Write-Host "   Backend:  api.meshvi.org"
Write-Host "   Frontend: meshvi.org"
Write-Host "========================================================================" -ForegroundColor Green

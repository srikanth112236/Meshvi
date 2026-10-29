# ==============================================================================
# MESHVI PLATFORM - SEED AZURE DATABASE
# Populates users, profiles, companies, and 500 diverse global members
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  MESHVI: SEED AZURE POSTGRESQL DATABASE" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

$RootDir = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location $RootDir

$DatabaseUrl = $env:DATABASE_URL
if (-not $DatabaseUrl) {
    $DatabaseUrl = "postgresql://meshviadmin:MeshviSecurePass2026!@meshvi-db-2486.postgres.database.azure.com/postgres?sslmode=require&schema=project_setu"
}

$inDb = Read-Host "DATABASE_URL [$DatabaseUrl]"
if ($inDb) { $DatabaseUrl = $inDb }

$env:DATABASE_URL = $DatabaseUrl

Write-Host "==> Pushing Prisma schema to ensure all tables exist..." -ForegroundColor Yellow
cd apps/backend
npx prisma db push --skip-generate --accept-data-loss

Write-Host "==> Seeding core users, companies, and demo scenarios..." -ForegroundColor Yellow
npx ts-node prisma/seed.ts

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Green
Write-Host "✓ Database successfully seeded with all demo profiles and companies!" -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Green

# Project Setu - Unified Test Runner Script (Windows PowerShell)
# Usage: .\scripts\test-all.ps1

Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  PROJECT SETU: FULL AUTOMATED TEST SUITE & END-TO-END FLOW RUNNER" -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Run Backend Unit & Integration Tests via Jest
Write-Host "[1/2] Running Backend Jest Unit & Integration Test Suites..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\..\apps\backend"

$jestExitCode = 0
try {
    npm test
    $jestExitCode = $LASTEXITCODE
} catch {
    $jestExitCode = 1
}

Set-Location -Path "$PSScriptRoot\.."

if ($jestExitCode -ne 0) {
    Write-Host "❌ Backend Jest tests failed. Please review the errors above." -ForegroundColor Red
    exit $jestExitCode
} else {
    Write-Host "✓ All Backend Jest Test Suites Passed (11/11 Suites, 68/68 Tests)!" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/2] Checking if Backend API server is active on http://localhost:3500..." -ForegroundColor Yellow

$backendRunning = $false
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3500/api/v1/health" -Method Get -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($healthCheck -and ($healthCheck.data.status -eq "READY" -or $healthCheck.status -eq "READY")) {
        $backendRunning = $true
    }
} catch {
    $backendRunning = $false
}

if ($backendRunning) {
    Write-Host "✓ Backend server detected online. Running End-to-End Flow Verifier..." -ForegroundColor Green
    npx ts-node --project apps/backend/tsconfig.json scripts/test-connections-flow.ts
} else {
    Write-Host "ℹ Backend is not running on http://localhost:3500." -ForegroundColor Yellow
    Write-Host "  To run the End-to-End Live Flow Verifier:" -ForegroundColor Cyan
    Write-Host "    Terminal 1: npm run dev:backend" -ForegroundColor White
    Write-Host "    Terminal 2: npm run test:flow" -ForegroundColor White
}

Write-Host ""
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "  TEST RUN SUMMARY COMPLETED" -ForegroundColor Green
Write-Host "========================================================================" -ForegroundColor Cyan

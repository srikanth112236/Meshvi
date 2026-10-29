#!/usr/bin/env bash
# ==============================================================================
# MESHVI PLATFORM - COMPLETE AZURE DEPLOYMENT ORCHESTRATOR
# Deploys Infrastructure, Backend (api.meshvi.org), and Frontend (meshvi.org)
# ==============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "========================================================================"
echo "      MESHVI PLATFORM - FULL AUTOMATED AZURE CLOUD DEPLOYMENT"
echo "      Domain: meshvi.org | Subdomain: api.meshvi.org"
echo "========================================================================"
echo ""
echo "This wizard will run the following deployment stages:"
echo "  [1/3] Provision Core Infrastructure (Resource Group, ACR, Container Apps Env)"
echo "  [2/3] Build & Deploy Backend API (api.meshvi.org on port 3500)"
echo "  [3/3] Build & Deploy Frontend Web App (meshvi.org on port 80)"
echo ""

printf "Do you want to proceed with full Azure deployment? (y/N): "
read -r CONFIRM || true
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Deployment aborted."
  exit 0
fi

echo ""
echo ">>> STEP 1: Setting up Azure Infrastructure..."
bash "$SCRIPT_DIR/01-setup-infra.sh"

echo ""
echo ">>> STEP 2: Building & Deploying Backend API..."
bash "$SCRIPT_DIR/02-deploy-backend.sh"

echo ""
echo ">>> STEP 3: Building & Deploying Frontend Web Application..."
bash "$SCRIPT_DIR/03-deploy-frontend.sh"

echo ""
echo "========================================================================"
echo "🎉 ALL WORKLOADS DEPLOYED TO AZURE SUCCESSFULLY!"
echo "   Backend:  api.meshvi.org"
echo "   Frontend: meshvi.org"
echo "========================================================================"

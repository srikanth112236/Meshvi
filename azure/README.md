# 🚀 MESHVI Azure Cloud Shell Deployment Guide

This guide walks you through deploying the **Backend (`api.meshvi.org`)** and **Frontend (`meshvi.org`)** workloads to Microsoft Azure using the Azure CLI in **Azure Cloud Shell**.

---

## 📋 Architecture Overview

* **Domain**: `meshvi.org`
* **Frontend**: `https://meshvi.org` & `https://www.meshvi.org` (Vite React + Nginx on Azure Container Apps / Static Web Apps)
* **Backend Subdomain**: `https://api.meshvi.org` (NestJS 10 + Prisma ORM on Azure Container Apps, Port `3500`)
* **Registry**: Azure Container Registry (ACR) with serverless cloud builds (`az acr build`)
* **Environment**: Azure Container Apps Managed Environment with automatic TLS/SSL

---

## ⚡ Quick Start: Deploy from Azure Cloud Shell

### 1. Open Azure Cloud Shell
1. Go to [https://shell.azure.com](https://shell.azure.com) or click the **Cloud Shell (`>_`)** icon at the top of the [Azure Portal](https://portal.azure.com).
2. Ensure **Bash** environment is selected (not PowerShell).

### 2. Clone the Repository
Run the following in Azure Cloud Shell:
```bash
git clone https://github.com/srikanth112236/Meshvi.git
cd Meshvi
chmod +x azure/*.sh
```

---

## 🛠️ Deployment Options

### Option A: Complete One-Click Automated Deployment
Run the orchestrator script which provisions infrastructure and deploys both backend and frontend in order:
```bash
./azure/deploy-all.sh
```

---

### Option B: Deploy Workloads Individually

#### Step 1: Provision Core Infrastructure (Resource Group, ACR & Container Apps Env)
```bash
./azure/01-setup-infra.sh
```
*Creates Resource Group (`rg-meshvi-prod`), Azure Container Registry, and Container Apps Environment (`cae-meshvi-prod`). Configuration is saved to `.azure-env`.*

#### Step 2: Deploy Backend API Individually (`api.meshvi.org`)
```bash
./azure/02-deploy-backend.sh
```
* Prompts for your PostgreSQL `DATABASE_URL`.
* Builds the backend Docker image directly inside Azure ACR (no local Docker needed).
* Creates / updates the Container App `meshvi-backend` listening on port `3500`.
* Outputs the default Azure FQDN (e.g. `meshvi-backend.xxxx.southeastasia.azurecontainerapps.io`).

#### Step 3: Deploy Frontend Web Application Individually (`meshvi.org`)
```bash
./azure/03-deploy-frontend.sh
```
* Injects `VITE_API_URL=https://api.meshvi.org/api/v1` and Google OAuth credentials.
* Builds the Nginx Vite image directly inside Azure ACR.
* Creates / updates Container App `meshvi-frontend` on port `80`.
* Outputs the default Azure FQDN.

*(Alternative: If you prefer Azure Static Web Apps, run `./azure/03-deploy-frontend-swa.sh`).*

---

## 🌐 DNS & Custom Domain Configuration (GoDaddy / Namecheap / Cloudflare)

Once your workloads are deployed, configure the following DNS records in your domain registrar:

| Type | Name / Host | Value / Points To | Notes |
| :--- | :--- | :--- | :--- |
| **CNAME** | `api` | `<your-backend-fqdn>` | Points `api.meshvi.org` to Backend Container App |
| **CNAME** | `www` | `<your-frontend-fqdn>` | Points `www.meshvi.org` to Frontend Container App |
| **A** | `@` | `<static-ip-from-script-output>` | Points apex `meshvi.org` to Container Apps IP |
| **TXT** | `asuid` | `<your-frontend-fqdn>` | Domain ownership verification for apex domain |

---

## 🔒 Bind Custom Domains & Free SSL Certificates

After your DNS records propagate (typically 2-10 minutes):

### 1. Bind Backend Subdomain (`api.meshvi.org`):
```bash
az containerapp hostname add \
  --name meshvi-backend \
  --resource-group rg-meshvi-prod \
  --hostname api.meshvi.org

az containerapp hostname bind \
  --name meshvi-backend \
  --resource-group rg-meshvi-prod \
  --hostname api.meshvi.org \
  --environment cae-meshvi-prod \
  --validation-method CNAME
```

### 2. Bind Frontend Domains (`www.meshvi.org` & `meshvi.org`):
```bash
# www.meshvi.org
az containerapp hostname add \
  --name meshvi-frontend \
  --resource-group rg-meshvi-prod \
  --hostname www.meshvi.org

az containerapp hostname bind \
  --name meshvi-frontend \
  --resource-group rg-meshvi-prod \
  --hostname www.meshvi.org \
  --environment cae-meshvi-prod \
  --validation-method CNAME

# meshvi.org (Apex)
az containerapp hostname add \
  --name meshvi-frontend \
  --resource-group rg-meshvi-prod \
  --hostname meshvi.org

az containerapp hostname bind \
  --name meshvi-frontend \
  --resource-group rg-meshvi-prod \
  --hostname meshvi.org \
  --environment cae-meshvi-prod \
  --validation-method HTTP
```

Azure automatically generates, provisions, and auto-renews free TLS/SSL certificates for all domains!

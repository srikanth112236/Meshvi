# ==============================================================================
# Meshvi Backend — Deploy to Azure Linux VM (Workload 4)
# Exact NexaTalent VM Deployment Architecture
# ==============================================================================

param (
    [string]$ResourceGroup = "meshvi-workloads-rg",
    [string]$VmName = "meshvi-compute-vm",
    [string]$BackendImage = "meshvi-backend"
)

$ErrorActionPreference = "Stop"

# Auto-detect existing Resource Group if meshvi-workloads-rg does not exist
$rgCheck = az group show --name $ResourceGroup 2>$null
if (-not $rgCheck) {
    $altCheck = az group show --name "rg-meshvi-prod" 2>$null
    if ($altCheck) {
        $ResourceGroup = "rg-meshvi-prod"
    }
}

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Deploying Meshvi Backend to Azure Linux VM ($VmName)" -ForegroundColor Green
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green

# 1. Find ACR
Write-Host "`n[+] Checking Azure Container Registry (ACR)..." -ForegroundColor Cyan
$AcrLogin = (az acr list --resource-group $ResourceGroup --query '[0].loginServer' -o tsv 2>$null)
if (-not $AcrLogin) {
    $AcrLogin = (az acr list --query '[0].loginServer' -o tsv 2>$null)
}

if (-not $AcrLogin) {
    Write-Error "No Azure Container Registry found. Please run deploy-azure-5-workloads.ps1 first."
    exit 1
}

$AcrName = $AcrLogin.Split('.')[0]
Write-Host "[+] Found ACR: $AcrLogin" -ForegroundColor Green

# 2. Build Docker Image (Local Docker or ACR Cloud Build)
Write-Host "`n[+] Building Backend Docker Image..." -ForegroundColor Cyan

$dockerRunning = $false
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $null = & docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
    }
}

if ($dockerRunning) {
    Write-Host "    Building image locally with Docker..." -ForegroundColor Yellow
    docker build -t "${BackendImage}:latest" -f apps/backend/Dockerfile .
    az acr login --name $AcrName
    docker tag "${BackendImage}:latest" "$AcrLogin/${BackendImage}:latest"
    docker push "$AcrLogin/${BackendImage}:latest"
} else {
    Write-Host "    Docker daemon is not running locally (Azure Cloud Shell environment)." -ForegroundColor Cyan
    Write-Host "    Building image directly in Azure ACR (Cloud Build)..." -ForegroundColor Yellow
    az acr build --registry $AcrName --image "${BackendImage}:latest" --file apps/backend/Dockerfile .
}

if ($LASTEXITCODE -ne 0) {
    throw "Backend build failed."
}
Write-Host "[✓] Docker Image ready: $AcrLogin/${BackendImage}:latest" -ForegroundColor Green

# 3. Find VM Public IP
Write-Host "`n[+] Finding VM Public IP for $VmName..." -ForegroundColor Cyan
$VmIp = (az vm list-ip-addresses --resource-group $ResourceGroup --name $VmName --query '[0].virtualMachine.network.publicIpAddresses[0].ipAddress' -o tsv 2>$null)

if (-not $VmIp) {
    Write-Host "[!] Could not automatically find VM Public IP for $VmName." -ForegroundColor Yellow
    $VmIp = Read-Host "Enter Azure VM Public IP"
}

$VmIp = $VmIp.Trim()
Write-Host "[+] Target VM: azureuser@$VmIp" -ForegroundColor Green

# 4. Prepare Environment Configuration
if (Test-Path ".env.production") {
    Write-Host "[+] Copying .env.production to VM..." -ForegroundColor Cyan
    scp -o StrictHostKeyChecking=no ".env.production" "azureuser@${VmIp}:~/meshvi.env"
} elseif (Test-Path ".env") {
    Write-Host "[+] Copying .env to VM..." -ForegroundColor Cyan
    scp -o StrictHostKeyChecking=no ".env" "azureuser@${VmIp}:~/meshvi.env"
} else {
    Write-Host "[+] Generating minimal environment file..." -ForegroundColor Cyan
    $DbUrl = $env:DATABASE_URL
    if (-not $DbUrl) {
        $dbHost = (az postgres flexible-server list --resource-group $ResourceGroup --query '[0].fullyQualifiedDomainName' -o tsv 2>$null)
        if (-not $dbHost) {
            $dbHost = (az postgres flexible-server list --query '[0].fullyQualifiedDomainName' -o tsv 2>$null)
        }
        if ($dbHost) {
            $DbUrl = "postgresql://meshviadmin:MeshviSecurePass2026!@${dbHost}/postgres?sslmode=require&schema=project_setu"
        }
    }

    $jwtSecret = if ($env:JWT_SECRET) { $env:JWT_SECRET } else { "meshvi-super-secret-jwt-key-2026-production" }

@"
NODE_ENV=production
PORT=3500
DATABASE_URL=${DbUrl}
FRONTEND_URL=https://meshvi.org
JWT_SECRET=${jwtSecret}
GOOGLE_CLIENT_ID=$env:GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=$env:GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=https://meshvi.org/auth/google/callback
AI_PRIMARY_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=$env:GEMINI_API_KEY
"@ | Set-Content -Path "meshvi.env" -Encoding UTF8
    scp -o StrictHostKeyChecking=no "meshvi.env" "azureuser@${VmIp}:~/meshvi.env"
    Remove-Item -Path "meshvi.env" -Force -ErrorAction SilentlyContinue
}

# 5. Remote Deploy via SSH
Write-Host "[+] Deploying container to VM via SSH..." -ForegroundColor Cyan

$AcrPass = (az acr credential show --name $AcrName --query 'passwords[0].value' -o tsv).Trim()

$RemoteScript = @"
set -e

# 1. Install Docker on VM if missing
if ! command -v docker &> /dev/null; then
  echo '==> Installing Docker on Ubuntu VM...'
  sudo apt-get update -y
  sudo apt-get install -y docker.io
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker azureuser
fi

# 2. Ensure data and uploads directories exist
mkdir -p /home/azureuser/meshvi-data/uploads

# 3. Authenticate with Azure Container Registry
echo '$AcrPass' | sudo docker login $AcrLogin -u $AcrName --password-stdin

# 4. Pull latest Backend Docker Image
echo '==> Pulling latest Docker image...'
sudo docker pull $AcrLogin/${BackendImage}:latest

# 5. Stop existing container if running
sudo docker stop meshvi-backend 2>/dev/null || true
sudo docker rm meshvi-backend 2>/dev/null || true

# 6. Apply Prisma database schema
echo '==> Ensuring database tables exist (Prisma DB Push)...'
sudo docker run --rm \
  --env-file /home/azureuser/meshvi.env \
  $AcrLogin/${BackendImage}:latest \
  npx prisma db push --schema=prisma/schema.prisma || true

# 7. Run updated container on port 3500 and port 80
echo '==> Starting Meshvi Backend container...'
sudo docker run -d \
  --name meshvi-backend \
  -p 3500:3500 \
  -p 80:3500 \
  --restart unless-stopped \
  -v /home/azureuser/meshvi-data/uploads:/app/apps/backend/uploads \
  --env-file /home/azureuser/meshvi.env \
  $AcrLogin/${BackendImage}:latest

sleep 3
sudo docker ps --filter "name=meshvi-backend"
"@

# Upload and execute deploy script safely
Set-Content -Path "_deploy.sh" -Value $RemoteScript -Encoding UTF8
scp -o StrictHostKeyChecking=no "_deploy.sh" "azureuser@${VmIp}:~/deploy.sh"
Remove-Item -Path "_deploy.sh" -Force -ErrorAction SilentlyContinue

ssh -o StrictHostKeyChecking=no "azureuser@$VmIp" "bash ~/deploy.sh"

Write-Host "`n=========================================" -ForegroundColor Green
Write-Host "SUCCESS! Meshvi Backend deployed to Azure VM ($VmIp)" -ForegroundColor Green
Write-Host "API Endpoint (Port 3500): http://${VmIp}:3500/api/v1/health" -ForegroundColor Green
Write-Host "API Endpoint (Port 80):   http://${VmIp}/api/v1/health" -ForegroundColor Green
Write-Host "`nIn Hostinger DNS Zone for 'api.meshvi.org':" -ForegroundColor Yellow
Write-Host "  Type: A"
Write-Host "  Name: api"
Write-Host "  Points To: $VmIp"
Write-Host "=========================================" -ForegroundColor Green

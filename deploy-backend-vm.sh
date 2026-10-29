#!/bin/bash
# ==============================================================================
# Meshvi Backend — Deploy to Azure Linux VM (Workload 4)
# Exact NexaTalent VM Deployment Architecture
# ==============================================================================

set -e

RESOURCE_GROUP="meshvi-workloads-rg"
VM_NAME="meshvi-compute-vm"
BACKEND_IMAGE="meshvi-backend"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Auto-detect existing Resource Group
if ! az group show --name "$RESOURCE_GROUP" >/dev/null 2>&1; then
  if az group show --name "rg-meshvi-prod" >/dev/null 2>&1; then
    RESOURCE_GROUP="rg-meshvi-prod"
  fi
fi

echo "========================================="
echo "Building & Deploying Meshvi Backend to Azure VM ($VM_NAME)"
echo "Resource Group: $RESOURCE_GROUP"
echo "========================================="

# 1. Find ACR
echo -e "\n[+] Checking Azure Container Registry (ACR)..."
ACR_LOGIN=$(az acr list --resource-group "$RESOURCE_GROUP" --query '[0].loginServer' -o tsv 2>/dev/null || az acr list --query '[0].loginServer' -o tsv 2>/dev/null || echo "")

if [ -z "$ACR_LOGIN" ]; then
  echo "Error: No Azure Container Registry found. Please run deploy-azure-5-workloads.sh first."
  exit 1
fi

ACR_NAME=$(echo "$ACR_LOGIN" | cut -d. -f1)
echo "[+] Found ACR: $ACR_LOGIN"

# 2. Build Docker Image
echo -e "\n[+] Building Backend Docker Image..."
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  echo "    Building image locally with Docker..."
  docker build -t "${BACKEND_IMAGE}:latest" -f apps/backend/Dockerfile .
  az acr login --name "$ACR_NAME"
  docker tag "${BACKEND_IMAGE}:latest" "$ACR_LOGIN/${BACKEND_IMAGE}:latest"
  docker push "$ACR_LOGIN/${BACKEND_IMAGE}:latest"
else
  echo "    Building image directly in Azure ACR (Cloud Build)..."
  az acr build --registry "$ACR_NAME" --image "${BACKEND_IMAGE}:latest" --file apps/backend/Dockerfile .
fi

echo "[✓] Docker image ready: $ACR_LOGIN/${BACKEND_IMAGE}:latest"

# 3. Find VM Public IP
echo -e "\n[+] Finding VM Public IP for $VM_NAME..."
VM_IP=$(az vm list-ip-addresses --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --query '[0].virtualMachine.network.publicIpAddresses[0].ipAddress' -o tsv 2>/dev/null || echo "")

if [ -z "$VM_IP" ]; then
  read -rp "Enter Azure VM Public IP: " VM_IP
fi

VM_IP=$(echo "$VM_IP" | tr -d '\r\n ')
echo "[+] Target VM: azureuser@$VM_IP"

# 4. Prepare Environment Configuration
if [ -f ".env.production" ]; then
  echo "[+] Copying .env.production to VM..."
  scp -o StrictHostKeyChecking=no ".env.production" "azureuser@$VM_IP:~/meshvi.env"
elif [ -f ".env" ]; then
  echo "[+] Copying .env to VM..."
  scp -o StrictHostKeyChecking=no ".env" "azureuser@$VM_IP:~/meshvi.env"
fi

# 5. Remote Deploy via SSH
echo "[+] Deploying container to VM via SSH..."
ACR_PASS=$(az acr credential show --name "$ACR_NAME" --query 'passwords[0].value' -o tsv)

ssh -o StrictHostKeyChecking=no "azureuser@$VM_IP" << REMOTEEOF
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
  echo '$ACR_PASS' | sudo docker login $ACR_LOGIN -u $ACR_NAME --password-stdin

  # 4. Pull latest Backend Docker Image
  sudo docker pull $ACR_LOGIN/${BACKEND_IMAGE}:latest

  # 5. Stop existing container if running
  sudo docker stop meshvi-backend 2>/dev/null || true
  sudo docker rm meshvi-backend 2>/dev/null || true

  # 6. Run updated container on port 3500 and port 80
  sudo docker run -d \
    --name meshvi-backend \
    -p 3500:3500 \
    -p 80:3500 \
    --restart unless-stopped \
    -v /home/azureuser/meshvi-data/uploads:/app/apps/backend/uploads \
    --env-file /home/azureuser/meshvi.env \
    $ACR_LOGIN/${BACKEND_IMAGE}:latest

  sudo docker ps --filter "name=meshvi-backend"
REMOTEEOF

echo "========================================="
echo "SUCCESS! Meshvi Backend deployed to Azure VM ($VM_IP)"
echo "API Endpoint (Port 3500): http://$VM_IP:3500/api/v1/health"
echo "API Endpoint (Port 80):   http://$VM_IP/api/v1/health"
echo ""
echo "In Hostinger DNS Zone for 'api.meshvi.org':"
echo "  Type: A"
echo "  Name: api"
echo "  Points To: $VM_IP"
echo "========================================="

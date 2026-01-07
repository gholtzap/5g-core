#!/bin/bash
# Build all Docker images for 5G Core Test Environment

# Don't exit on error - we want to see what failed
set +e

echo "=== Building 5G Core Docker Images ==="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "[1/7] Building NRF (Network Repository Function)..."
docker build -t 5g-core-nrf:latest ./nrf
echo "✓ NRF built successfully"
echo ""

echo "[2/7] Building AUSF (Authentication Server Function)..."
docker build -t 5g-core-ausf:latest ./ausf
echo "✓ AUSF built successfully"
echo ""

echo "[3/7] Building UDM (Unified Data Management)..."
docker build -t 5g-core-udm:latest ./udm
echo "✓ UDM built successfully"
echo ""

echo "[4/7] Building NSSF (Network Slice Selection Function)..."
docker build -t 5g-core-nssf:latest ./nssf
echo "✓ NSSF built successfully"
echo ""

echo "[5/7] Building AMF (Access & Mobility Management Function)..."
docker build -t 5g-core-amf:latest ./amf
echo "✓ AMF built successfully"
echo ""

echo "[6/7] Building SMF (Session Management Function)..."
docker build -t 5g-core-smf:latest ./smf
echo "✓ SMF built successfully"
echo ""

echo "[7/7] Building UERANSIM (gNB + UE Simulator)..."
docker build -t 5g-core-ueransim:latest -f ./docker/ueransim/Dockerfile .
echo "✓ UERANSIM built successfully"
echo ""

echo "=== All Docker images built successfully! ==="
echo ""
echo "Next steps:"
echo "  1. Provision subscriber: node scripts/provision-subscriber.js"
echo "  2. Start core network: ./scripts/start-core.sh"
echo "  3. Start test: ./scripts/start-test.sh"
echo ""
echo "Press Enter to close this window..."
read

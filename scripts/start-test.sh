#!/bin/bash
# Start UERANSIM gNB and UE for testing

# Don't exit on error - we want to see what failed
set +e

echo "=== Starting UERANSIM Test Environment ==="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "Checking if core network is running..."
if ! docker-compose ps | grep -q "amf.*Up"; then
    echo "ERROR: AMF is not running!"
    echo "Please start the core network first with ./scripts/start-core.sh"
    exit 1
fi
echo "✓ Core network is running"
echo ""

echo "[1/2] Starting UERANSIM gNB (5G Base Station Simulator)..."
docker-compose up -d ueransim-gnb
echo "Waiting for gNB to establish NGAP connection with AMF..."
sleep 10
echo "✓ gNB started"
echo ""

echo "[2/2] Starting UERANSIM UE (5G User Equipment Simulator)..."
docker-compose up -d ueransim-ue
echo "Waiting for UE to attempt registration..."
sleep 5
echo "✓ UE started"
echo ""

echo "=== UERANSIM Test Started ==="
echo ""
echo "Monitor the attach procedure:"
echo "  View all logs:"
echo "    ./scripts/view-logs.sh"
echo ""
echo "  View specific NF logs:"
echo "    docker-compose logs -f ueransim-ue"
echo "    docker-compose logs -f ueransim-gnb"
echo "    docker-compose logs -f amf"
echo "    docker-compose logs -f ausf"
echo "    docker-compose logs -f smf"
echo ""
echo "Expected test flow:"
echo "  1. gNB establishes NGAP connection with AMF (N2 interface)"
echo "  2. UE sends Registration Request via gNB"
echo "  3. AMF authenticates UE via AUSF"
echo "  4. AMF completes registration"
echo "  5. UE requests PDU Session (internet DNN)"
echo "  6. SMF attempts to contact UPF (will fail - no UPF deployed)"
echo ""
echo "This failure will show you exactly which UPF endpoints are needed!"
echo ""
echo "Press Enter to close this window..."
read

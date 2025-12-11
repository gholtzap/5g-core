#!/bin/bash
# Start 5G Core Network Functions in correct order

# Don't exit on error - we want to see what failed
set +e

echo "=== Starting 5G Core Network ==="
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "[1/3] Starting NRF (Network Repository Function)..."
docker-compose up -d nrf
echo "Waiting for NRF to be healthy..."
sleep 10
echo "✓ NRF started"
echo ""

echo "[2/3] Starting support NFs (AUSF, UDM, NSSF)..."
docker-compose up -d ausf udm nssf
echo "Waiting for support NFs to start..."
sleep 10
echo "✓ Support NFs started"
echo ""

echo "[3/3] Starting core NFs (AMF, SMF)..."
docker-compose up -d amf smf
echo "Waiting for core NFs to start..."
sleep 10
echo "✓ Core NFs started"
echo ""

echo "=== 5G Core Network started successfully! ==="
echo ""
echo "Check status:"
echo "  docker-compose ps"
echo ""
echo "View logs:"
echo "  ./scripts/view-logs.sh"
echo "  OR"
echo "  docker-compose logs -f <service-name>"
echo ""
echo "Check NRF registrations:"
echo "  docker-compose logs nrf | grep -i \"registered\""
echo ""
echo "Next: Start UERANSIM test with ./scripts/start-test.sh"
echo ""
echo "Press Enter to close this window..."
read

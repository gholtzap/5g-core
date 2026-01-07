#!/bin/bash

set -e

echo "========================================"
echo "5G Core - Clean Start Test"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "[1/7] Cleaning existing containers and volumes..."
docker compose down -v 2>/dev/null || true
echo "✓ Cleaned"
echo ""

echo "[2/7] Updating git submodules..."
git submodule update --remote --merge
echo "✓ Submodules updated"
echo ""

echo "[3/7] Building all services (--no-cache)..."
docker compose build --no-cache
echo "✓ Build complete"
echo ""

echo "[4/7] Starting MongoDB..."
docker compose up -d mongodb

echo "Waiting for MongoDB to be healthy..."
timeout=60
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if docker compose ps mongodb | grep -q "healthy"; then
        echo "✓ MongoDB is healthy"
        break
    fi
    sleep 2
    elapsed=$((elapsed + 2))
    echo -n "."
done

if [ $elapsed -ge $timeout ]; then
    echo ""
    echo "✗ MongoDB failed to become healthy"
    docker compose logs mongodb
    exit 1
fi
echo ""

echo "[5/7] Starting core network services..."
docker compose up -d nrf ausf udm nssf amf smf upf

echo "Waiting for services to start..."
sleep 30

FAILED_SERVICES=""
for service in nrf ausf udm nssf amf smf upf; do
    if ! docker compose ps $service | grep -q "Up"; then
        FAILED_SERVICES="$FAILED_SERVICES $service"
    fi
done

if [ -n "$FAILED_SERVICES" ]; then
    echo "✗ Failed services:$FAILED_SERVICES"
    echo ""
    echo "Logs for failed services:"
    for service in $FAILED_SERVICES; do
        echo "--- $service ---"
        docker compose logs --tail=50 $service
    done
    exit 1
fi

echo "✓ All core services are running"
echo ""

echo "[6/7] Starting UERANSIM (gNB and UE)..."
docker compose up -d ueransim-gnb
sleep 15

docker compose up -d ueransim-ue
sleep 15

if ! docker compose ps ueransim-gnb | grep -q "Up"; then
    echo "✗ gNB failed to start"
    docker compose logs --tail=50 ueransim-gnb
    exit 1
fi

if ! docker compose ps ueransim-ue | grep -q "Up"; then
    echo "✗ UE failed to start"
    docker compose logs --tail=50 ueransim-ue
    exit 1
fi

echo "✓ UERANSIM components started"
echo ""

echo "[7/7] Checking for critical errors in logs..."

CRITICAL_ERRORS=0

for service in mongodb nrf ausf udm nssf amf smf upf ueransim-gnb ueransim-ue; do
    if docker compose logs --tail=100 $service 2>/dev/null | grep -iE "panic|fatal|critical" | grep -v "panic="; then
        echo "✗ Critical errors found in $service"
        CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
    fi
done

if [ $CRITICAL_ERRORS -gt 0 ]; then
    echo ""
    echo "✗ Test FAILED: $CRITICAL_ERRORS service(s) have critical errors"
    exit 1
fi

echo "✓ No critical errors detected"
echo ""

echo "========================================"
echo "✓ Clean Start Test PASSED"
echo "========================================"
echo ""
echo "All services started successfully from blank slate"
echo ""
echo "Next steps:"
echo "  - View logs: ./scripts/helpers/view-logs.sh"
echo "  - Check status: docker compose ps"
echo "  - Stop services: docker compose down"
echo ""

exit 0

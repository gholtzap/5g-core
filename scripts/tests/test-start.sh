#!/bin/bash

set -e

gum style \
	--foreground 212 --border-foreground 212 --border double \
	--align center --width 50 --margin "1 2" --padding "2 4" \
	'5G Core' 'Clean Start Test'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

gum style --foreground 86 --bold "[1/7] Cleaning existing containers and volumes..."
gum spin --spinner dot --title "Stopping and removing containers/volumes..." -- \
    docker compose down -v 2>/dev/null || true
gum style --foreground 42 "✓ Cleaned"
echo ""

gum style --foreground 86 --bold "[2/7] Updating git submodules..."
gum spin --spinner dot --title "Updating submodules..." -- \
    git submodule update --remote --merge
gum style --foreground 42 "✓ Submodules updated"
echo ""

gum style --foreground 86 --bold "[3/7] Building all services..."
gum spin --spinner dot --title "Building with --no-cache (this may take 10-20 minutes)..." -- \
    docker compose build --no-cache
gum style --foreground 42 "✓ Build complete"
echo ""

gum style --foreground 86 --bold "[4/7] Starting MongoDB..."
docker compose up -d mongodb

gum spin --spinner dot --title "Waiting for MongoDB to be healthy..." -- bash -c '
timeout=60
elapsed=0
while [ $elapsed -lt $timeout ]; do
    if docker compose ps mongodb | grep -q "healthy"; then
        exit 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
done
exit 1
'

if [ $? -ne 0 ]; then
    gum style --foreground 196 "✗ MongoDB failed to become healthy"
    docker compose logs mongodb
    exit 1
fi
gum style --foreground 42 "✓ MongoDB is healthy"
echo ""

gum style --foreground 86 --bold "[5/7] Starting core network services..."
docker compose up -d nrf ausf udm nssf amf smf upf

gum spin --spinner dot --title "Waiting for services to start..." -- sleep 30

FAILED_SERVICES=""
for service in nrf ausf udm nssf amf smf upf; do
    if ! docker compose ps $service | grep -q "Up"; then
        FAILED_SERVICES="$FAILED_SERVICES $service"
    fi
done

if [ -n "$FAILED_SERVICES" ]; then
    gum style --foreground 196 "✗ Failed services:$FAILED_SERVICES"
    echo ""
    gum style --foreground 208 "Logs for failed services:"
    for service in $FAILED_SERVICES; do
        gum style --foreground 220 "--- $service ---"
        docker compose logs --tail=50 $service
    done
    exit 1
fi

gum style --foreground 42 "✓ All core services are running"
echo ""

gum style --foreground 86 --bold "[6/7] Starting UERANSIM..."
docker compose up -d ueransim-gnb
gum spin --spinner dot --title "Waiting for gNB to initialize..." -- sleep 15

docker compose up -d ueransim-ue
gum spin --spinner dot --title "Waiting for UE to initialize..." -- sleep 15

if ! docker compose ps ueransim-gnb | grep -q "Up"; then
    gum style --foreground 196 "✗ gNB failed to start"
    docker compose logs --tail=50 ueransim-gnb
    exit 1
fi

if ! docker compose ps ueransim-ue | grep -q "Up"; then
    gum style --foreground 196 "✗ UE failed to start"
    docker compose logs --tail=50 ueransim-ue
    exit 1
fi

gum style --foreground 42 "✓ UERANSIM components started"
echo ""

gum style --foreground 86 --bold "[7/7] Checking for critical errors..."

CRITICAL_ERRORS=0

for service in mongodb nrf ausf udm nssf amf smf upf ueransim-gnb ueransim-ue; do
    if docker compose logs --tail=100 $service 2>/dev/null | grep -iE "panic|fatal|critical" | grep -viE "panic=|criticality"; then
        gum style --foreground 196 "✗ Critical errors found in $service"
        CRITICAL_ERRORS=$((CRITICAL_ERRORS + 1))
    fi
done

if [ $CRITICAL_ERRORS -gt 0 ]; then
    echo ""
    gum style --foreground 196 "✗ Test FAILED: $CRITICAL_ERRORS service(s) have critical errors"
    exit 1
fi

gum style --foreground 42 "✓ No critical errors detected"
echo ""

gum style \
    --foreground 42 --border-foreground 42 --border double \
    --align center --width 50 --margin "1 2" --padding "2 4" \
    'Clean Start Test PASSED!'

echo ""
gum style --foreground 42 --bold "All services started successfully from blank slate"
echo ""

gum style --foreground 244 "Next steps:"
gum style --foreground 255 "  - View logs: ./scripts/helpers/view-logs.sh"
gum style --foreground 255 "  - Check status: docker compose ps"
gum style --foreground 255 "  - Stop services: docker compose down"
echo ""

exit 0

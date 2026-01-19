#!/bin/bash

set -e

if ! command -v gum &> /dev/null; then
    echo "Error: This script requires 'gum'. Install from https://github.com/charmbracelet/gum"
    exit 1
fi

gum style \
	--foreground 212 --border-foreground 212 --border double \
	--align center --width 50 --margin "1 2" --padding "2 4" \
	'5G CORE' 'Automated Test Script'

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
TEST_DIR="/tmp/5g-core-test-$(date +%s)"

cleanup() {
    if [ -n "$TEST_DIR" ] && [ -d "$TEST_DIR" ]; then
        gum style --foreground 220 "Cleaning up test environment..."
        cd "$REPO_ROOT"
        if [ -d "$TEST_DIR" ]; then
            (cd "$TEST_DIR" && docker compose down -v 2>/dev/null || true)
        fi
        rm -rf "$TEST_DIR"
        gum style --foreground 42 "✓ Test environment cleaned up"
    fi
}

trap cleanup EXIT

gum style --foreground 86 --bold "[1/6] Creating test environment..."
echo ""

gum style --foreground 220 "Creating test directory: $TEST_DIR"
mkdir -p "$TEST_DIR"
gum style --foreground 42 "✓ Test directory created"
echo ""

gum style --foreground 86 --bold "[2/6] Copying repository..."
echo ""

gum style --foreground 220 "Copying current repository state..."
rsync -a --exclude='.git' --exclude='node_modules' --exclude='target' \
    --exclude='UERANSIM' --exclude='Open5GS' --exclude='test-free5gc' \
    "$REPO_ROOT/" "$TEST_DIR/"
gum style --foreground 42 "✓ Repository copied"
echo ""

cd "$TEST_DIR"

gum style --foreground 86 --bold "[3/6] Running setup with defaults..."
echo ""

check_command() {
    if command -v $1 &> /dev/null; then
        gum style --foreground 42 "✓ $2 is installed"
        return 0
    else
        gum style --foreground 196 "✗ $2 is not installed"
        return 1
    fi
}

gum style --foreground 220 "Checking prerequisites..."
prerequisites_met=true

check_command docker "Docker" || prerequisites_met=false
check_command git "Git" || prerequisites_met=false

if [ "$prerequisites_met" = false ]; then
    gum style --foreground 196 "✗ Prerequisites check failed"
    exit 1
fi

gum style --foreground 42 "✓ Prerequisites met"
echo ""

gum style --foreground 220 "Initializing git submodules..."
git init
git submodule init
git submodule update --init --recursive
gum style --foreground 42 "✓ Submodules initialized"
echo ""

if [ ! -d "UERANSIM" ]; then
    gum style --foreground 220 "Cloning UERANSIM..."
    git clone --depth 1 https://github.com/aligungr/UERANSIM.git
    gum style --foreground 42 "✓ UERANSIM cloned"
    echo ""
fi

if [ -f .env.example ] && [ ! -f .env ]; then
    gum style --foreground 220 "Creating .env from template..."
    cp .env.example .env
    gum style --foreground 42 "✓ Environment configured"
    echo ""
fi

gum style --foreground 42 "✓ Setup complete"
echo ""

gum style --foreground 86 --bold "[4/6] Building all services with --no-cache..."
echo ""
gum style --foreground 244 "This may take 10-20 minutes..."
echo ""

gum style --foreground 220 "Building Docker images..."
docker compose build --no-cache
gum style --foreground 42 "✓ Build complete"
echo ""

gum style --foreground 86 --bold "[5/6] Starting all services..."
echo ""

gum style --foreground 220 "Starting MongoDB..."
docker compose up -d mongodb

gum style --foreground 220 "Waiting for MongoDB to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q "1"; then
        gum style --foreground 42 "✓ MongoDB ready"
        break
    fi
    attempt=$((attempt + 1))
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    gum style --foreground 196 "✗ MongoDB failed to start"
    exit 1
fi
echo ""

gum style --foreground 220 "Starting all services..."
docker compose up -d --scale web-ui=0
gum style --foreground 42 "✓ Services started"
echo ""

gum style --foreground 86 --bold "[6/6] Monitoring for errors..."
echo ""

gum style --foreground 220 "Waiting 60 seconds for services to stabilize..."
sleep 60
gum style --foreground 42 "✓ Wait complete"
echo ""

gum style --foreground 220 "Checking Docker logs for errors..."
echo ""

services=$(docker compose ps --services)
error_found=false

for service in $services; do
    gum style --foreground 244 "Checking $service..."

    if ! docker compose ps "$service" | grep -q "Up"; then
        gum style --foreground 196 "✗ $service is not running"
        error_found=true
        continue
    fi

    error_logs=$(docker compose logs "$service" 2>&1 | grep -iE "error|fatal|panic|exception" | grep -viE "error_code.*0|no error" || true)

    if [ -n "$error_logs" ]; then
        gum style --foreground 196 "✗ Errors found in $service:"
        echo "$error_logs" | head -20
        echo ""
        error_found=true
    else
        gum style --foreground 42 "✓ $service: no errors"
    fi
done

echo ""

if [ "$error_found" = true ]; then
    gum style \
        --foreground 196 --border-foreground 196 --border double \
        --align center --width 50 --margin "1 2" --padding "2 4" \
        'Test Failed' 'Errors detected in logs'
    echo ""
    exit 1
else
    gum style \
        --foreground 42 --border-foreground 42 --border double \
        --align center --width 50 --margin "1 2" --padding "2 4" \
        'Test Passed' 'No errors detected'
    echo ""
    exit 0
fi

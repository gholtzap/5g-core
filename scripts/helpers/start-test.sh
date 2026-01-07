#!/bin/bash

set +e

gum style --foreground 212 --bold "UERANSIM Test Environment"
echo ""

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

gum spin --spinner dot --title "Checking if core network is running..." -- sleep 1

if ! docker compose ps | grep -q "amf.*Up"; then
    gum style --foreground 196 "✗ AMF is not running!"
    gum style --foreground 208 "Please start the core network first with ./scripts/start.sh"
    exit 1
fi
gum style --foreground 42 "✓ Core network is running"
echo ""

gum style --foreground 86 --bold "[1/2] Starting UERANSIM gNB..."
docker compose up -d ueransim-gnb
gum spin --spinner dot --title "Waiting for gNB to establish NGAP connection with AMF..." -- sleep 10
gum style --foreground 42 "✓ gNB started"
echo ""

gum style --foreground 86 --bold "[2/2] Starting UERANSIM UE..."
docker compose up -d ueransim-ue
gum spin --spinner dot --title "Waiting for UE to attempt registration..." -- sleep 5
gum style --foreground 42 "✓ UE started"
echo ""

gum style --foreground 42 --bold "✓ UERANSIM Test Started!"
echo ""

gum style --foreground 220 --bold "Monitor the attach procedure:"
echo ""

gum style --foreground 244 "View all logs:"
gum style --foreground 86 "  ./scripts/helpers/view-logs.sh"
echo ""

gum style --foreground 244 "View specific NF logs:"
gum style --foreground 255 "  docker compose logs -f ueransim-ue"
gum style --foreground 255 "  docker compose logs -f ueransim-gnb"
gum style --foreground 255 "  docker compose logs -f amf"
gum style --foreground 255 "  docker compose logs -f ausf"
gum style --foreground 255 "  docker compose logs -f smf"
echo ""

gum style --foreground 220 --bold "Expected test flow:"
gum style --foreground 255 "  1. gNB establishes NGAP connection with AMF (N2 interface)"
gum style --foreground 255 "  2. UE sends Registration Request via gNB"
gum style --foreground 255 "  3. AMF authenticates UE via AUSF"
gum style --foreground 255 "  4. AMF completes registration"
gum style --foreground 255 "  5. UE requests PDU Session (internet DNN)"
gum style --foreground 255 "  6. SMF establishes session with UPF"
echo ""
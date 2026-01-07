#!/bin/bash

gum style --foreground 212 --bold "5G Core Network Logs"
gum style --foreground 244 "Press Ctrl+C to stop viewing logs"
echo ""

docker compose logs -f --tail=50
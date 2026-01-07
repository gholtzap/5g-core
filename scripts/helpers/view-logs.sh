#!/bin/bash

gum style \
	--foreground 212 --border-foreground 212 --border double \
	--align center --width 50 --margin "1 2" --padding "2 4" \
	'5G Core Network Logs'

echo ""
gum style --foreground 244 "Press Ctrl+C to stop viewing logs"
echo ""

docker compose logs -f --tail=50
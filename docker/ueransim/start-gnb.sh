#!/bin/bash

gum style --foreground 86 --bold "Starting UERANSIM gNB..."
gum spin --spinner dot --title "Waiting for network initialization..." -- sleep 5
gum style --foreground 42 "✓ Starting gNB process"
nr-gnb -c /config/gnb.yaml

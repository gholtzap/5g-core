#!/bin/bash

gum style --foreground 86 --bold "Starting UERANSIM UE..."
gum spin --spinner dot --title "Waiting for gNB to start..." -- sleep 10
gum style --foreground 42 "✓ Starting UE process"
nr-ue -c /config/ue.yaml

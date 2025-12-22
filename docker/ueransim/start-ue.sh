#!/bin/bash

echo "Waiting for gNB to start..."
sleep 10
echo "Starting UERANSIM UE..."
nr-ue -c /config/ue.yaml

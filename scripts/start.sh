#!/bin/bash

set -e

echo "========================================="
echo "5G Core Startup Script"
echo "========================================="
echo ""

git submodule update --remote --merge
git add .
git commit -m "Update submodules" || echo "No changes to commit"
git push origin master

echo "Building AMF (no cache)..."
docker compose build amf --no-cache

echo "Building all services..."
docker compose build

echo "Starting MongoDB..."
docker compose up -d mongodb

echo "Waiting for MongoDB to be ready..."
sleep 15

echo "Provisioning subscriber..."
./provision-subscriber-local.sh

echo "Starting all services..."
docker compose up

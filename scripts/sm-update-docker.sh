#!/bin/bash
#docker compose build amf --no-cache
git submodule update --remote --merge
git add .
git commit -m "Update submodules"
git push origin master
docker compose build ausf --no-cache
docker compose build
docker compose up -d mongodb
echo "Waiting for MongoDB to be ready..."
sleep 15
MONGODB_URI='mongodb://localhost:27017' node scripts/provision-subscriber.js
docker compose up
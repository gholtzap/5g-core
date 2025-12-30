#!/bin/bash
#docker compose build amf --no-cache
git submodule update --remote --merge
git add .
git commit -m "Update submodules"
git push origin master
docker compose build ausf --no-cache
docker compose build
node scripts/provision-subscriber.js
docker compose up
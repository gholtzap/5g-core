#!/bin/bash
#docker compose build amf --no-cache
git submodule update --remote --merge
git add .
git commit -m "Update submodules"
git push origin master
docker compose build amf --no-cache
docker compose build
docker compose up   
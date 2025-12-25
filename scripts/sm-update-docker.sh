#!/bin/bash
#docker compose build ueransim-gnb --no-cache
git submodule update --remote --merge
git add .
git commit -m "Update submodules"
git push origin master
docker compose build
docker compose up   
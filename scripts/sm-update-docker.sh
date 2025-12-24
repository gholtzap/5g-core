#!/bin/bash
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
docker rmi $(docker images -q)
docker volume rm $(docker volume ls -q)
sleep 1
git submodule update --remote --merge
git add .
git commit -m "Update submodules"
git push origin master
sleep 5
docker compose build
sleep 2
docker compose up   

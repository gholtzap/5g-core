# Quick Start

## 1. Build All Images

```bash
docker-compose build nrf
docker-compose build ausf
docker-compose build udm
docker-compose build nssf
docker-compose build amf
docker-compose build smf
docker-compose build ueransim-gnb ueransim-ue
```

Or build everything at once:

```bash
docker-compose build
```

## 2. Provision Subscriber

```bash
npm install mongodb dotenv
node scripts/provision-subscriber.js
```

## 3. Start Core Network (See All Logs in Real-Time)

Instead of `./scripts/start-core.sh`, run:

```bash
docker-compose up nrf

docker-compose up ausf udm nssf

docker-compose up amf smf
```

**OR** start everything and watch logs in real-time:

```bash
docker-compose up
```

This will show ALL logs from ALL containers in one terminal. Press `Ctrl+C` to stop.

## 4. Start in Background (Recommended)

```bash
# Start everything in detached mode
docker-compose up -d

# Then watch logs from specific services
docker-compose logs -f amf
docker-compose logs -f smf
docker-compose logs -f ueransim-ue
```

## 5. View Logs Anytime

```bash
# View all logs
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs from specific service
docker-compose logs -f amf

# View last 100 lines
docker-compose logs --tail=100 amf

# Search logs for errors
docker-compose logs smf | grep -i error
docker-compose logs amf | grep -i ngap
```

## 6. Check Status

```bash
# See which containers are running
docker-compose ps

# See resource usage
docker stats

# See networks
docker network ls
docker network inspect 5g-core_5g-core-net
```


### View Real-Time Container Output

```bash
# Attach to running container (see live output)
docker attach ueransim-ue

# Press Ctrl+P then Ctrl+Q to detach without stopping
```

### Execute Commands Inside Container

```bash
# Get a shell inside a container
docker exec -it amf /bin/bash

# Run a specific command
docker exec -it nrf cat /app/config/config.yaml
```

## 8. Complete Test Sequence (Manual, Visible Errors)

Open Git Bash and run:

```bash
cd /c/Users/Gavin/dev/5g-core

# 1. Build everything (see any build errors)
docker-compose build

# 2. Provision subscriber
node scripts/provision-subscriber.js

# 3. Start core network in background
docker-compose up -d nrf ausf udm nssf amf smf

# 4. Wait a few seconds, then check if they're running
sleep 10
docker-compose ps

# 5. Check NRF registrations
docker-compose logs nrf | grep -i register

# 6. Start UERANSIM test
docker-compose up ueransim-gnb ueransim-ue

# This will show live logs from gNB and UE
# You'll see the attach procedure and where it fails!
# Press Ctrl+C when done
```



appendix

```
docker compose build
docker compose up
```
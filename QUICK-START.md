# Quick Start - Manual Commands

If scripts are giving you trouble, run these commands directly in Git Bash or PowerShell:

## Prerequisites

```bash
cd c:/Users/Gavin/dev/5g-core
```

## 1. Build All Images (See All Errors)

Instead of `./scripts/build-all.sh`, run:

```bash
# Build each service (errors will be visible)
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

**If a build fails**, you'll see exactly which one and why!

## 2. Provision Subscriber

```bash
npm install mongodb dotenv
node scripts/provision-subscriber.js
```

## 3. Start Core Network (See All Logs in Real-Time)

Instead of `./scripts/start-core.sh`, run:

```bash
# Start NRF first
docker-compose up nrf

# Once NRF is healthy (you'll see it in logs), open a NEW terminal and run:
docker-compose up ausf udm nssf

# Once those are up, open ANOTHER terminal and run:
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

## 7. Troubleshooting Commands

### Restart a Specific Service

```bash
docker-compose restart amf
```

### Rebuild a Specific Service

```bash
docker-compose up -d --build amf
```

### Stop Everything

```bash
docker-compose down
```

### Stop and Remove Volumes (Fresh Start)

```bash
docker-compose down -v
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

## 9. Debugging Specific Issues

### If NRF won't start:

```bash
docker-compose logs nrf
# Look for MongoDB connection errors
```

### If AMF won't start:

```bash
docker-compose logs amf
# Look for SCTP or NGAP errors
```

### If builds fail:

```bash
# Build with verbose output
docker-compose build --no-cache --progress=plain amf
```

### If containers keep restarting:

```bash
# See why they're failing
docker-compose logs <service-name>

# Remove restart policy temporarily
docker-compose up --no-restart amf
```

## 10. Useful Docker Commands

```bash
# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove everything (fresh start)
docker system prune -a

# See disk usage
docker system df
```

## Pro Tip: Use Multiple Terminals

1. **Terminal 1**: Run `docker-compose up amf` (watch AMF logs)
2. **Terminal 2**: Run `docker-compose up smf` (watch SMF logs)
3. **Terminal 3**: Run `docker-compose up ueransim-ue` (watch UE attach)

This way you can see exactly what's happening in each component!

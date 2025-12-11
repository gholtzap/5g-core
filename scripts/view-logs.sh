#!/bin/bash
# View logs from all 5G Core containers

echo "=== 5G Core Network Logs ==="
echo ""
echo "Press Ctrl+C to stop viewing logs"
echo ""

# Follow logs from all containers
docker-compose logs -f --tail=50

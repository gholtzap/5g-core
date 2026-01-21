#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

check_container_status() {
    local container_name=$1

    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        local health=$(docker inspect --format='{{.State.Health.Status}}' $container_name 2>/dev/null || echo "none")

        if [ "$health" = "healthy" ]; then
            echo "healthy"
        elif [ "$health" = "unhealthy" ]; then
            echo "unhealthy"
        elif [ "$health" = "starting" ]; then
            echo "starting"
        else
            echo "running"
        fi
    else
        echo "stopped"
    fi
}

check_port() {
    local host=$1
    local port=$2

    if nc -z -w1 $host $port 2>/dev/null; then
        echo "up"
    else
        echo "down"
    fi
}

check_http_endpoint() {
    local url=$1

    local response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 $url 2>/dev/null || echo "000")
    echo "$response"
}

count_recent_errors() {
    local container=$1
    local minutes=${2:-5}

    docker logs --since ${minutes}m $container 2>&1 | grep -iE "error|fatal|panic|exception" | wc -l | tr -d ' '
}

gum style \
    --foreground 212 --border-foreground 212 --border double \
    --align center --width 70 --margin "1 0" --padding "1 4" \
    "5G CORE NETWORK" "Development Status Dashboard"

services=(
    "mongodb:MongoDB:Database"
    "nrf:NRF:NF Repository Function"
    "ausf:AUSF:Authentication Server"
    "udm:UDM:Unified Data Management"
    "nssf:NSSF:Network Slice Selection"
    "scp:SCP:Service Communication Proxy"
    "sepp:SEPP:Security Edge Protection"
    "amf:AMF:Access & Mobility Mgmt"
    "smf:SMF:Session Management"
    "upf:UPF:User Plane Function"
    "ueransim-gnb:gNB:Base Station Simulator"
    "ueransim-ue:UE:User Equipment Simulator"
    "web-ui:WebUI:Management Interface"
)

healthy_count=0
total_count=${#services[@]}

service_table="Service,Status,Health\n"

for service_entry in "${services[@]}"; do
    IFS=':' read -r container_name short_name full_name <<< "$service_entry"
    status=$(check_container_status "$container_name")

    case "$status" in
        healthy)
            status_icon="✓"
            status_text="Running"
            health_text="Healthy"
            ((healthy_count++))
            ;;
        running)
            status_icon="✓"
            status_text="Running"
            health_text="No Check"
            ((healthy_count++))
            ;;
        starting)
            status_icon="⏳"
            status_text="Starting"
            health_text="Starting"
            ;;
        unhealthy)
            status_icon="⚠"
            status_text="Running"
            health_text="Unhealthy"
            ;;
        stopped)
            status_icon="✗"
            status_text="Stopped"
            health_text="Down"
            ;;
    esac

    service_table+="$status_icon $short_name,$status_text,$health_text\n"
done

echo -e "$service_table" | gum table --border rounded --border.foreground 86 -p | gum style --padding "0 2" --margin "0 2"

summary_text="Services Running: $healthy_count/$total_count"
if [ $healthy_count -eq $total_count ]; then
    summary_color=120
else
    summary_color=214
fi

gum style \
    --foreground $summary_color --bold \
    --align center --margin "0 2" \
    "$summary_text"

gum style \
    --foreground 212 --border-foreground 212 --border rounded \
    --align left --margin "1 2" --padding "0 1" \
    "PORT STATUS"

port_table="Service,Port,Status\n"

port_checks=(
    "MongoDB|27017"
    "NRF_API|8082"
    "AUSF_API|8081"
    "UDM_API|8084"
    "NSSF_API|8083"
    "SCP_API|8088"
    "SEPP_API|8089"
    "AMF_API|8086"
    "SMF_API|8085"
    "UPF_API|8087"
    "WebUI|3001"
)

for entry in "${port_checks[@]}"; do
    IFS='|' read -r service_name port <<< "$entry"
    display_name=$(echo "$service_name" | sed 's/_/ /g')
    status=$(check_port "localhost" "$port")

    if [ "$status" = "up" ]; then
        status_text="✓ Available"
    else
        status_text="✗ Down"
    fi

    port_table+="$display_name,$port,$status_text\n"
done

echo -e "$port_table" | gum table --border rounded --border.foreground 86 -p | gum style --padding "0 2" --margin "0 2"

if docker ps --format '{{.Names}}' | grep -q "^mongodb$"; then
    mongo_check=$(docker exec mongodb mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null || echo "0")

    if [ "$mongo_check" = "1" ]; then
        db_names=$(docker exec mongodb mongosh --quiet --eval "db.adminCommand('listDatabases').databases.map(d => d.name).join(', ')" 2>/dev/null || echo "unknown")
        subscriber_count=$(docker exec mongodb mongosh --quiet udm --eval "db.subscribers.countDocuments()" 2>/dev/null || echo "0")
        collections=$(docker exec mongodb mongosh --quiet udm --eval "db.getCollectionNames().join(', ')" 2>/dev/null || echo "unknown")

        gum style \
            --foreground 212 --border-foreground 212 --border rounded \
            --align left --margin "1 2" --padding "0 1" \
            "MONGODB STATUS"

        printf "Connection: ✓ Active\nDatabases: $db_names\nCollections: $collections\nSubscribers: $subscriber_count" | \
            gum style \
                --foreground 250 --border-foreground 86 --border rounded \
                --padding "1 2" --margin "0 2"
    fi
fi

gum style \
    --foreground 212 --border-foreground 212 --border rounded \
    --align left --margin "1 2" --padding "0 1" \
    "API CONNECTIVITY"

api_table="API Endpoint,HTTP Status\n"

api_checks=(
    "NRF_Discovery|http://localhost:8082/nnrf-nfm/v1/nf-instances"
    "AUSF_Auth|http://localhost:8081/nausf-auth/v1/ue-authentications"
    "UDM_UEAU|http://localhost:8084/nudm-ueau/v1/"
    "NSSF_Selection|http://localhost:8083/nnssf-nsselection/v1/network-slice-information"
    "SMF_PDU|http://localhost:8085/nsmf-pdusession/v1/"
)

for entry in "${api_checks[@]}"; do
    IFS='|' read -r api_name url <<< "$entry"
    display_name=$(echo "$api_name" | sed 's/_/ /g')
    http_code=$(check_http_endpoint "$url")

    case "$http_code" in
        200|204)
            status_text="✓ $http_code OK"
            ;;
        000)
            status_text="✗ Unreachable"
            ;;
        *)
            status_text="⚠ $http_code"
            ;;
    esac

    api_table+="$display_name,$status_text\n"
done

echo -e "$api_table" | gum table --border rounded --border.foreground 86 -p | gum style --padding "0 2" --margin "0 2"

gum style \
    --foreground 212 --border-foreground 212 --border rounded \
    --align left --margin "1 2" --padding "0 1" \
    "ERROR MONITORING"

error_table="Service,Errors (5m)\n"

for service_entry in "${services[@]}"; do
    IFS=':' read -r container_name short_name full_name <<< "$service_entry"
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        error_count=$(count_recent_errors "$container_name" 5)

        if [ "$error_count" -eq 0 ]; then
            error_text="✓ 0"
        elif [ "$error_count" -lt 5 ]; then
            error_text="⚠ $error_count"
        else
            error_text="✗ $error_count"
        fi

        error_table+="$short_name,$error_text\n"
    fi
done

echo -e "$error_table" | gum table --border rounded --border.foreground 86 -p | gum style --padding "0 2" --margin "0 2"

if docker ps --format '{{.Names}}' | grep -q "^nrf$"; then
    nf_count=$(curl -s http://localhost:8082/nnrf-nfm/v1/nf-instances 2>/dev/null | grep -o '"nfInstanceId"' | wc -l | tr -d ' ')

    gum style \
        --foreground 212 --border-foreground 212 --border rounded \
        --align left --margin "1 2" --padding "0 1" \
        "QUICK DIAGNOSTICS"

    printf "Registered NFs: $nf_count\nMongoDB Subscribers: $subscriber_count" | \
        gum style \
            --foreground 250 --border-foreground 86 --border rounded \
            --padding "1 2" --margin "0 2"
fi

echo ""

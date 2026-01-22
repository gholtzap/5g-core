#!/bin/bash

set -e

gum style \
	--foreground 212 --border-foreground 212 --border double \
	--align center --width 50 --margin "1 2" --padding "2 4" \
	'5G CORE' 'Interactive Test Script'

preflight_checks() {
    gum style --foreground 86 --bold "Pre-flight validation..."
    echo ""

    if ! command -v docker &> /dev/null; then
        gum style --foreground 196 "✗ Docker is not installed"
        gum style --foreground 208 "  Install from: https://www.docker.com/get-started"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        gum style --foreground 196 "✗ Docker daemon is not running"
        gum style --foreground 208 "  Start Docker Desktop and try again"
        exit 1
    fi

    mem_bytes=$(docker info --format '{{.MemTotal}}' 2>/dev/null || echo "0")
    mem_gb=$((mem_bytes / 1024 / 1024 / 1024))

    if [ "$mem_gb" -lt 16 ]; then
        gum style --foreground 196 "✗ Docker memory is too low: ${mem_gb}GB (16GB+ required)"
        gum style --foreground 208 "  Configure Docker Desktop → Settings → Resources → Memory"
        gum style --foreground 208 "  Set memory to at least 16GB to avoid build failures"
        exit 1
    fi

    gum style --foreground 42 "✓ Docker is running with ${mem_gb}GB memory"
    echo ""
}

show_menu() {
    choice=$(gum choose --header "Select test mode:" \
        "Quick Start" \
        "Full Rebuild" \
        "Update & Build" \
        "Clean Start" \
        "Custom" \
        "Update Submodules" \
        "Rebuild Web UI" \
        "Exit")
}

do_quick_start() {
    gum style --foreground 86 --bold "Quick Start Mode"
    echo ""

    check_mongodb
    start_services
}

do_full_rebuild() {
    gum style --foreground 86 --bold "Full Rebuild Mode"
    echo ""

    update_submodules
    commit_push
    rebuild_all_no_cache
    check_mongodb
    start_services
}

do_update_build() {
    gum style --foreground 86 --bold "Update & Build Mode"
    echo ""

    update_submodules
    commit_push

    changed_services=($(detect_changed_submodules))

    if [ ${#changed_services[@]} -gt 0 ]; then
        gum style --foreground 220 "Building updated services with --no-cache: ${changed_services[*]}"
        for service in "${changed_services[@]}"; do
            if ! docker compose build --no-cache "$service"; then
                gum style --foreground 196 "✗ Build failed for $service"
                gum style --foreground 208 "Recovery suggestions:"
                gum style --foreground 208 "  1. Check logs above for specific errors"
                gum style --foreground 208 "  2. Try: docker compose build --no-cache $service"
                gum style --foreground 208 "  3. Clean old images: docker system prune"
                exit 1
            fi
        done
        gum style --foreground 42 "✓ Updated services rebuilt"
        echo ""
    else
        gum style --foreground 244 "No submodule changes detected"
        echo ""
    fi

    gum style --foreground 220 "Building remaining services..."
    if ! docker compose build; then
        gum style --foreground 196 "✗ Docker build failed"
        gum style --foreground 208 "Recovery suggestions:"
        gum style --foreground 208 "  1. Check Docker resources (CPU/Memory/Disk)"
        gum style --foreground 208 "  2. Try: docker compose build --no-cache"
        gum style --foreground 208 "  3. Clean old images: docker system prune"
        exit 1
    fi
    gum style --foreground 42 "✓ Build complete"
    echo ""

    check_mongodb
    start_services
}

do_clean_start() {
    gum style --foreground 86 --bold "Clean Start Mode"
    echo ""

    gum style --foreground 220 "Stopping and removing containers/volumes..."
    docker compose down -v
    gum style --foreground 42 "✓ Containers and volumes removed"
    echo ""

    if gum confirm "Update submodules?"; then
        update_submodules
        commit_push
    fi

    if gum confirm "Rebuild with --no-cache?"; then
        gum style --foreground 220 "Building all services with --no-cache..."
        if ! docker compose build --no-cache; then
            gum style --foreground 196 "✗ Docker build failed"
            gum style --foreground 208 "Recovery suggestions:"
            gum style --foreground 208 "  1. Check Docker resources (CPU/Memory/Disk)"
            gum style --foreground 208 "  2. Clean old images: docker system prune"
            gum style --foreground 208 "  3. Restart Docker Desktop"
            exit 1
        fi
    else
        gum style --foreground 220 "Building all services..."
        if ! docker compose build; then
            gum style --foreground 196 "✗ Docker build failed"
            gum style --foreground 208 "Recovery suggestions:"
            gum style --foreground 208 "  1. Try with --no-cache: docker compose build --no-cache"
            gum style --foreground 208 "  2. Check Docker resources (CPU/Memory/Disk)"
            gum style --foreground 208 "  3. Clean old images: docker system prune"
            exit 1
        fi
    fi
    gum style --foreground 42 "✓ Build complete"
    echo ""

    check_mongodb
    start_services
}

do_custom() {
    gum style --foreground 86 --bold "Custom Configuration"
    echo ""

    if gum confirm "Update git submodules?"; then
        update_submodules

        if gum confirm "Commit and push changes?"; then
            commit_push
        fi
    fi

    if gum confirm "Stop existing containers?"; then
        if gum confirm "Clean volumes too?"; then
            gum style --foreground 220 "Stopping containers and removing volumes..."
            docker compose down -v
        else
            gum style --foreground 220 "Stopping containers..."
            docker compose down
        fi
        gum style --foreground 42 "✓ Containers stopped"
        echo ""
    fi

    if gum confirm "Rebuild Docker images?"; then
        if gum confirm "Rebuild other services?"; then
            if gum confirm "Use --no-cache for all?"; then
                gum style --foreground 220 "Building all services with --no-cache..."
                if ! docker compose build --no-cache; then
                    gum style --foreground 196 "✗ Docker build failed"
                    gum style --foreground 208 "Recovery suggestions:"
                    gum style --foreground 208 "  1. Check Docker resources (CPU/Memory/Disk)"
                    gum style --foreground 208 "  2. Clean old images: docker system prune"
                    gum style --foreground 208 "  3. Restart Docker Desktop"
                    exit 1
                fi
            else
                gum style --foreground 220 "Building all services..."
                if ! docker compose build; then
                    gum style --foreground 196 "✗ Docker build failed"
                    gum style --foreground 208 "Recovery suggestions:"
                    gum style --foreground 208 "  1. Try with --no-cache: docker compose build --no-cache"
                    gum style --foreground 208 "  2. Check Docker resources (CPU/Memory/Disk)"
                    gum style --foreground 208 "  3. Clean old images: docker system prune"
                    exit 1
                fi
            fi
            gum style --foreground 42 "✓ Build complete"
            echo ""
        fi
    fi

    check_mongodb
    start_services
}

do_update_submodules() {
    gum style --foreground 86 --bold "Update Submodules Mode"
    echo ""

    update_submodules
    commit_push
}

do_rebuild_webui() {
    gum style --foreground 86 --bold "Rebuild Web UI"
    echo ""

    gum style --foreground 220 "Stopping web-ui..."
    docker compose stop web-ui
    gum style --foreground 42 "✓ Web UI stopped"
    echo ""

    gum style --foreground 220 "Rebuilding web-ui with --no-cache..."
    if ! docker compose build --no-cache web-ui; then
        gum style --foreground 196 "✗ Web UI build failed"
        gum style --foreground 208 "Recovery suggestions:"
        gum style --foreground 208 "  1. Check Node.js dependencies in web-ui/"
        gum style --foreground 208 "  2. Clean old images: docker system prune"
        gum style --foreground 208 "  3. Check Docker resources"
        exit 1
    fi
    gum style --foreground 42 "✓ Web UI rebuilt"
    echo ""

    gum style --foreground 220 "Starting web-ui..."
    if ! docker compose up -d web-ui; then
        gum style --foreground 196 "✗ Web UI failed to start"
        gum style --foreground 208 "Check logs: docker compose logs web-ui"
        exit 1
    fi
    gum style --foreground 42 "✓ Web UI started"
    echo ""

    gum style --foreground 86 --bold "Web Dashboard:"
    gum style --foreground 255 "  http://localhost:3001"
    echo ""
}

update_submodules() {
    gum style --foreground 220 "Updating git submodules..."
    git submodule status > /tmp/submodules_before.txt
    git submodule update --remote --merge
    git submodule status > /tmp/submodules_after.txt
    gum style --foreground 42 "✓ Submodules updated"
    echo ""
}

detect_changed_submodules() {
    local changed_services=()

    if [ -f /tmp/submodules_before.txt ] && [ -f /tmp/submodules_after.txt ]; then
        while IFS= read -r line; do
            submodule=$(echo "$line" | awk '{print $2}')
            case "$submodule" in
                amf) changed_services+=("amf") ;;
                ausf) changed_services+=("ausf") ;;
                nrf) changed_services+=("nrf") ;;
                nssf) changed_services+=("nssf") ;;
                scp) changed_services+=("scp") ;;
                sepp) changed_services+=("sepp") ;;
                udm) changed_services+=("udm") ;;
                smf) changed_services+=("smf") ;;
                upf) changed_services+=("upf") ;;
                scp) changed_services+=("scp") ;;
                sepp) changed_services+=("sepp") ;;
            esac
        done < <(diff /tmp/submodules_before.txt /tmp/submodules_after.txt | grep '^>' | awk '{print $2}')
    fi

    echo "${changed_services[@]}"
}

commit_push() {
    gum style --foreground 220 "Committing and pushing changes..."
    git add .
    if git commit -m "Update submodules" 2>/dev/null; then
        if git push origin dev 2>/dev/null; then
            gum style --foreground 42 "✓ Changes committed and pushed"
        else
            gum style --foreground 208 "⚠ Commit succeeded but push failed"
        fi
    else
        gum style --foreground 244 "No changes to commit"
    fi
    echo ""
}

rebuild_all_no_cache() {
    gum style --foreground 220 "Rebuilding all services with --no-cache..."
    if ! docker compose build --no-cache; then
        gum style --foreground 196 "✗ Docker build failed"
        gum style --foreground 208 "Recovery suggestions:"
        gum style --foreground 208 "  1. Check Docker resources (CPU/Memory/Disk)"
        gum style --foreground 208 "  2. Clean old images: docker system prune"
        gum style --foreground 208 "  3. Restart Docker Desktop"
        exit 1
    fi
    gum style --foreground 42 "✓ All services rebuilt"
    echo ""
}

check_mongodb() {
    if docker compose ps mongodb 2>/dev/null | grep -q "Up"; then
        gum style --foreground 42 "✓ MongoDB already running"
        echo ""
    else
        gum style --foreground 220 "Starting MongoDB..."
        docker compose up -d mongodb
        gum style --foreground 220 "Waiting for MongoDB to be ready..."

        max_attempts=30
        attempt=0
        while [ $attempt -lt $max_attempts ]; do
            if docker compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q "1"; then
                gum style --foreground 42 "✓ MongoDB ready"
                echo ""
                return 0
            fi
            attempt=$((attempt + 1))
            sleep 1
        done

        gum style --foreground 196 "✗ MongoDB failed to become ready after ${max_attempts}s"
        gum style --foreground 208 "Recovery suggestions:"
        gum style --foreground 208 "  1. Check logs: docker compose logs mongodb"
        gum style --foreground 208 "  2. Restart MongoDB: docker compose restart mongodb"
        gum style --foreground 208 "  3. Clean volumes: docker compose down -v"
        echo ""
        return 1
    fi
}

start_services() {
    provision="Yes"
    if ! gum confirm "Provision/update subscriber?" --default=true; then
        provision="No"
    fi

    if [[ $provision == "Yes" ]]; then
        if [ -f ./scripts/helpers/provision-subscriber-local.sh ]; then
            ./scripts/helpers/provision-subscriber-local.sh
        else
            gum style --foreground 208 "⚠ provision-subscriber-local.sh not found, skipping..."
        fi
        echo ""
    fi

    start_webui="Yes"
    if ! gum confirm "Start web dashboard?" --default=true; then
        start_webui="No"
    fi

    gum style --foreground 220 "Starting all services..."
    echo ""

    run_mode=$(gum choose --header "Run mode:" "Background" "Foreground (show logs)")

    if [[ $run_mode == "Foreground (show logs)" ]]; then
        if [[ $start_webui == "No" ]]; then
            if ! docker compose up --scale web-ui=0; then
                gum style --foreground 196 "✗ Services failed to start"
                gum style --foreground 208 "Recovery suggestions:"
                gum style --foreground 208 "  1. Check logs above for specific errors"
                gum style --foreground 208 "  2. Try: docker compose down && ./scripts/start.sh"
                gum style --foreground 208 "  3. Check service health: docker compose ps"
                exit 1
            fi
        else
            if ! docker compose up; then
                gum style --foreground 196 "✗ Services failed to start"
                gum style --foreground 208 "Recovery suggestions:"
                gum style --foreground 208 "  1. Check logs above for specific errors"
                gum style --foreground 208 "  2. Try: docker compose down && ./scripts/start.sh"
                gum style --foreground 208 "  3. Check service health: docker compose ps"
                exit 1
            fi
        fi
    else
        if [[ $start_webui == "No" ]]; then
            if ! docker compose up -d --scale web-ui=0; then
                gum style --foreground 196 "✗ Services failed to start"
                gum style --foreground 208 "Recovery suggestions:"
                gum style --foreground 208 "  1. Check logs: docker compose logs"
                gum style --foreground 208 "  2. Check service health: docker compose ps"
                gum style --foreground 208 "  3. Try: docker compose down && ./scripts/start.sh"
                exit 1
            fi
        else
            if ! docker compose up -d; then
                gum style --foreground 196 "✗ Services failed to start"
                gum style --foreground 208 "Recovery suggestions:"
                gum style --foreground 208 "  1. Check logs: docker compose logs"
                gum style --foreground 208 "  2. Check service health: docker compose ps"
                gum style --foreground 208 "  3. Try: docker compose down && ./scripts/start.sh"
                exit 1
            fi
        fi

        gum style --foreground 42 --bold "✓ All services started in background"
        echo ""

        if [[ $start_webui == "Yes" ]]; then
            gum style --foreground 86 --bold "Web Dashboard:"
            gum style --foreground 255 "  http://localhost:3001"
            echo ""
        fi

        gum style --foreground 244 "Useful commands:"
        gum style --foreground 255 "  View logs: docker compose logs -f [service-name]"
        gum style --foreground 255 "  View all logs: ./scripts/helpers/view-logs.sh"
        gum style --foreground 255 "  Check status: docker compose ps"
        gum style --foreground 255 "  Stop services: docker compose down"
        gum style --foreground 255 "  Start test: ./scripts/helpers/start-test.sh"
    fi
}

preflight_checks

while true; do
    show_menu

    case $choice in
        "Quick Start") do_quick_start; break ;;
        "Full Rebuild") do_full_rebuild; break ;;
        "Update & Build") do_update_build; break ;;
        "Clean Start") do_clean_start; break ;;
        "Custom") do_custom; break ;;
        "Update Submodules") do_update_submodules; break ;;
        "Rebuild Web UI") do_rebuild_webui; break ;;
        "Exit")
            gum style --foreground 244 "Exiting..."
            exit 0
            ;;
        *)
            gum style --foreground 196 "Invalid choice. Please try again."
            echo ""
            ;;
    esac
done

echo ""
gum style \
    --foreground 42 --border-foreground 42 --border double \
    --align center --width 50 --margin "1 2" --padding "2 4" \
    '5G Core Started!'
echo ""

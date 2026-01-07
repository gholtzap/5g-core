#!/bin/bash

set -e

echo "========================================="
echo "5G Core - Interactive Test Script"
echo "========================================="
echo ""

show_menu() {
    echo "Select test mode:"
    echo "  1) Quick Start (use existing images, skip git ops)"
    echo "  2) Full Rebuild (update submodules, rebuild all with --no-cache)"
    echo "  3) Update & Build (update submodules, rebuild changed components)"
    echo "  4) Clean Start (stop all, clean volumes, fresh start)"
    echo "  5) Custom (interactive configuration)"
    echo "  6) Update Submodules (update, commit, and push)"
    echo "  7) Exit"
    echo ""
    read -p "Choice [1-7]: " choice
    echo ""
}

do_quick_start() {
    echo "=== Quick Start Mode ==="
    echo ""

    check_mongodb
    start_services
}

do_full_rebuild() {
    echo "=== Full Rebuild Mode ==="
    echo ""

    update_submodules
    commit_push
    rebuild_all_no_cache
    check_mongodb
    start_services
}

do_update_build() {
    echo "=== Update & Build Mode ==="
    echo ""

    update_submodules
    commit_push

    read -p "Rebuild AMF with --no-cache? (y/N): " rebuild_amf
    if [[ $rebuild_amf =~ ^[Yy]$ ]]; then
        echo "Building AMF (no cache)..."
        docker compose build amf --no-cache
        echo ""
    fi

    echo "Building all services..."
    docker compose build
    echo ""

    check_mongodb
    start_services
}

do_clean_start() {
    echo "=== Clean Start Mode ==="
    echo ""

    echo "Stopping and removing all containers and volumes..."
    docker compose down -v
    echo "✓ Containers and volumes removed"
    echo ""

    read -p "Update submodules? (y/N): " update_sub
    if [[ $update_sub =~ ^[Yy]$ ]]; then
        update_submodules
        commit_push
    fi

    read -p "Rebuild with --no-cache? (y/N): " no_cache
    if [[ $no_cache =~ ^[Yy]$ ]]; then
        echo "Building all services with --no-cache..."
        docker compose build --no-cache
    else
        echo "Building all services..."
        docker compose build
    fi
    echo ""

    check_mongodb
    start_services
}

do_custom() {
    echo "=== Custom Configuration ==="
    echo ""

    read -p "Update git submodules? (y/N): " update_sub
    if [[ $update_sub =~ ^[Yy]$ ]]; then
        update_submodules

        read -p "Commit and push changes? (y/N): " do_commit
        if [[ $do_commit =~ ^[Yy]$ ]]; then
            commit_push
        fi
    fi

    read -p "Stop existing containers? (y/N): " stop_containers
    if [[ $stop_containers =~ ^[Yy]$ ]]; then
        read -p "Clean volumes too? (y/N): " clean_vols
        if [[ $clean_vols =~ ^[Yy]$ ]]; then
            docker compose down -v
        else
            docker compose down
        fi
        echo "✓ Containers stopped"
        echo ""
    fi

    read -p "Rebuild Docker images? (y/N): " rebuild
    if [[ $rebuild =~ ^[Yy]$ ]]; then
        read -p "Rebuild AMF with --no-cache? (y/N): " rebuild_amf
        if [[ $rebuild_amf =~ ^[Yy]$ ]]; then
            echo "Building AMF (no cache)..."
            docker compose build amf --no-cache
            echo ""
        fi

        read -p "Rebuild other services? (y/N): " rebuild_others
        if [[ $rebuild_others =~ ^[Yy]$ ]]; then
            read -p "Use --no-cache for all? (y/N): " no_cache_all
            if [[ $no_cache_all =~ ^[Yy]$ ]]; then
                echo "Building all services with --no-cache..."
                docker compose build --no-cache
            else
                echo "Building all services..."
                docker compose build
            fi
            echo ""
        fi
    fi

    check_mongodb
    start_services
}

do_update_submodules() {
    echo "=== Update Submodules Mode ==="
    echo ""

    update_submodules
    commit_push
}

update_submodules() {
    echo "Updating git submodules..."
    git submodule update --remote --merge
    echo "✓ Submodules updated"
    echo ""
}

commit_push() {
    echo "Committing and pushing changes..."
    git add .
    if git commit -m "Update submodules" 2>/dev/null; then
        if git push origin master 2>/dev/null; then
            echo "✓ Changes committed and pushed"
        else
            echo "⚠ Commit succeeded but push failed"
        fi
    else
        echo "No changes to commit"
    fi
    echo ""
}

rebuild_all_no_cache() {
    echo "Rebuilding all services with --no-cache..."
    docker compose build --no-cache
    echo "✓ All services rebuilt"
    echo ""
}

check_mongodb() {
    if docker compose ps mongodb 2>/dev/null | grep -q "Up"; then
        echo "✓ MongoDB already running"
        echo ""
    else
        echo "Starting MongoDB..."
        docker compose up -d mongodb

        echo "Waiting for MongoDB to be ready..."
        sleep 15
        echo "✓ MongoDB ready"
        echo ""
    fi
}

start_services() {
    read -p "Provision/update subscriber? (Y/n): " provision
    if [[ ! $provision =~ ^[Nn]$ ]]; then
        if [ -f ./scripts/provision-subscriber-local.sh ]; then
            ./scripts/provision-subscriber-local.sh
        else
            echo "⚠ provision-subscriber-local.sh not found, skipping..."
        fi
        echo ""
    fi

    echo "Starting all services..."
    echo ""

    read -p "Run in foreground (show logs) or background? (f/B): " run_mode
    echo ""

    if [[ $run_mode =~ ^[Ff]$ ]]; then
        docker compose up
    else
        docker compose up -d

        echo "✓ All services started in background"
        echo ""
        echo "Useful commands:"
        echo "  View logs: docker compose logs -f [service-name]"
        echo "  View all logs: ./scripts/view-logs.sh"
        echo "  Check status: docker compose ps"
        echo "  Stop services: docker compose down"
        echo "  Start test: ./scripts/start-test.sh"
    fi
}

while true; do
    show_menu

    case $choice in
        1) do_quick_start; break ;;
        2) do_full_rebuild; break ;;
        3) do_update_build; break ;;
        4) do_clean_start; break ;;
        5) do_custom; break ;;
        6) do_update_submodules; break ;;
        7) echo "Exiting..."; exit 0 ;;
        *) echo "Invalid choice. Please try again."; echo "" ;;
    esac
done

echo ""
echo "========================================="
echo "5G Core Started!"
echo "========================================="
echo ""

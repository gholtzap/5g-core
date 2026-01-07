#!/bin/bash

set -e

gum style \
	--foreground 212 --border-foreground 212 --border double \
	--align center --width 50 --margin "1 2" --padding "2 4" \
	'5G CORE' 'Interactive Test Script'

show_menu() {
    choice=$(gum choose --header "Select test mode:" \
        "Quick Start" \
        "Full Rebuild" \
        "Update & Build" \
        "Clean Start" \
        "Custom" \
        "Update Submodules" \
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

    if gum confirm "Rebuild AMF with --no-cache?"; then
        gum spin --spinner dot --title "Building AMF (no cache)..." -- \
            docker compose build amf --no-cache
        echo ""
    fi

    gum spin --spinner dot --title "Building all services..." -- \
        docker compose build
    echo ""

    check_mongodb
    start_services
}

do_clean_start() {
    gum style --foreground 86 --bold "Clean Start Mode"
    echo ""

    gum spin --spinner dot --title "Stopping and removing containers/volumes..." -- \
        docker compose down -v
    gum style --foreground 42 "✓ Containers and volumes removed"
    echo ""

    if gum confirm "Update submodules?"; then
        update_submodules
        commit_push
    fi

    if gum confirm "Rebuild with --no-cache?"; then
        gum spin --spinner dot --title "Building all services with --no-cache..." -- \
            docker compose build --no-cache
    else
        gum spin --spinner dot --title "Building all services..." -- \
            docker compose build
    fi
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
            docker compose down -v
        else
            docker compose down
        fi
        gum style --foreground 42 "✓ Containers stopped"
        echo ""
    fi

    if gum confirm "Rebuild Docker images?"; then
        if gum confirm "Rebuild AMF with --no-cache?"; then
            gum spin --spinner dot --title "Building AMF (no cache)..." -- \
                docker compose build amf --no-cache
            echo ""
        fi

        if gum confirm "Rebuild other services?"; then
            if gum confirm "Use --no-cache for all?"; then
                gum spin --spinner dot --title "Building all services with --no-cache..." -- \
                    docker compose build --no-cache
            else
                gum spin --spinner dot --title "Building all services..." -- \
                    docker compose build
            fi
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

update_submodules() {
    gum spin --spinner dot --title "Updating git submodules..." -- \
        git submodule update --remote --merge
    gum style --foreground 42 "✓ Submodules updated"
    echo ""
}

commit_push() {
    gum style --foreground 220 "Committing and pushing changes..."
    git add .
    if git commit -m "Update submodules" 2>/dev/null; then
        if git push origin master 2>/dev/null; then
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
    gum spin --spinner dot --title "Rebuilding all services with --no-cache..." -- \
        docker compose build --no-cache
    gum style --foreground 42 "✓ All services rebuilt"
    echo ""
}

check_mongodb() {
    if docker compose ps mongodb 2>/dev/null | grep -q "Up"; then
        gum style --foreground 42 "✓ MongoDB already running"
        echo ""
    else
        gum spin --spinner dot --title "Starting MongoDB..." -- \
            docker compose up -d mongodb

        gum spin --spinner dot --title "Waiting for MongoDB to be ready..." -- \
            sleep 15
        gum style --foreground 42 "✓ MongoDB ready"
        echo ""
    fi
}

start_services() {
    provision="Yes"
    if ! gum confirm "Provision/update subscriber?" --default=true; then
        provision="No"
    fi

    if [[ $provision == "Yes" ]]; then
        if [ -f ./scripts/provision-subscriber-local.sh ]; then
            ./scripts/provision-subscriber-local.sh
        else
            gum style --foreground 208 "⚠ provision-subscriber-local.sh not found, skipping..."
        fi
        echo ""
    fi

    gum style --foreground 220 "Starting all services..."
    echo ""

    run_mode=$(gum choose --header "Run mode:" "Background" "Foreground (show logs)")

    if [[ $run_mode == "Foreground (show logs)" ]]; then
        docker compose up
    else
        docker compose up -d

        gum style --foreground 42 --bold "✓ All services started in background"
        echo ""

        gum style --foreground 244 "Useful commands:"
        gum style --foreground 255 "  View logs: docker compose logs -f [service-name]"
        gum style --foreground 255 "  View all logs: ./scripts/view-logs.sh"
        gum style --foreground 255 "  Check status: docker compose ps"
        gum style --foreground 255 "  Stop services: docker compose down"
        gum style --foreground 255 "  Start test: ./scripts/start-test.sh"
    fi
}

while true; do
    show_menu

    case $choice in
        "Quick Start") do_quick_start; break ;;
        "Full Rebuild") do_full_rebuild; break ;;
        "Update & Build") do_update_build; break ;;
        "Clean Start") do_clean_start; break ;;
        "Custom") do_custom; break ;;
        "Update Submodules") do_update_submodules; break ;;
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

#!/bin/bash

set -e

echo "=========================================="
echo "  5G Core Network - Setup Script"
echo "=========================================="
echo ""

check_command() {
    if command -v $1 &> /dev/null; then
        echo "✓ $2 is installed"
        return 0
    else
        echo "✗ $2 is not installed"
        return 1
    fi
}

echo "[1/5] Checking prerequisites..."
echo ""

prerequisites_met=true

if check_command docker "Docker"; then
    docker --version
else
    prerequisites_met=false
    echo "  Install from: https://www.docker.com/get-started"
fi

if check_command docker-compose "Docker Compose" || check_command "docker compose" "Docker Compose"; then
    docker compose version 2>/dev/null || docker-compose --version
else
    prerequisites_met=false
    echo "  Docker Compose is required"
fi

if check_command git "Git"; then
    git --version
else
    prerequisites_met=false
    echo "  Install from: https://git-scm.com/"
fi

if check_command node "Node.js"; then
    node --version
    node_version=$(node --version | sed 's/v//' | cut -d. -f1)
    if [ "$node_version" -lt 18 ]; then
        echo "  ⚠ Warning: Node.js 18+ is recommended (current: v$node_version)"
    fi
else
    echo "  ⚠ Warning: Node.js not installed (required for subscriber provisioning)"
    echo "  Install from: https://nodejs.org/ (LTS version 18+)"
fi

echo ""

if [ "$prerequisites_met" = false ]; then
    echo "✗ Prerequisites check failed. Please install missing dependencies."
    exit 1
fi

echo "✓ All required prerequisites are met"
echo ""

echo "[2/6] Initializing git submodules..."
echo ""

if git submodule status | grep -q '^-'; then
    echo "Submodules not initialized. Initializing..."
    git submodule update --init --recursive
else
    echo "✓ Submodules already initialized"
    git submodule status
fi

echo ""
echo "✓ Submodules ready"
echo ""

echo "[3/6] Setting up UERANSIM (validation tool)..."
echo ""

if [ ! -d "UERANSIM" ]; then
    echo "UERANSIM not found. Cloning from GitHub..."
    git clone https://github.com/aligungr/UERANSIM.git
    echo "✓ UERANSIM cloned"
else
    echo "✓ UERANSIM already exists"
fi

echo ""

echo "[4/6] Configuring environment..."
echo ""

if [ -f .env ]; then
    echo "✓ .env file already exists"
    read -p "Do you want to reconfigure? (y/N): " reconfigure
    if [[ ! $reconfigure =~ ^[Yy]$ ]]; then
        echo "Skipping environment configuration"
    else
        rm .env
    fi
fi

if [ ! -f .env ]; then
    if [ ! -f .env.example ]; then
        echo "✗ .env.example not found"
        exit 1
    fi

    echo "Creating .env from template..."
    cp .env.example .env

    echo ""
    echo "MongoDB Atlas configuration required for subscriber provisioning."
    echo "If you don't have MongoDB Atlas credentials yet, you can configure this later."
    echo ""
    read -p "Do you have MongoDB Atlas credentials? (y/N): " has_mongo

    if [[ $has_mongo =~ ^[Yy]$ ]]; then
        echo ""
        echo "Please enter your MongoDB Atlas connection details:"
        read -p "Username: " mongo_user
        read -sp "Password: " mongo_pass
        echo ""
        read -p "Cluster (e.g., cluster0.xxxxx): " mongo_cluster

        mongo_uri="mongodb+srv://${mongo_user}:${mongo_pass}@${mongo_cluster}.mongodb.net/"

        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|MONGODB_URI=.*|MONGODB_URI=${mongo_uri}|" .env
        else
            sed -i "s|MONGODB_URI=.*|MONGODB_URI=${mongo_uri}|" .env
        fi

        echo "✓ MongoDB URI configured"
    else
        echo ""
        echo "You can configure MongoDB later by editing .env file"
        echo "Set MONGODB_URI to your MongoDB Atlas connection string"
    fi
fi

echo ""
echo "✓ Environment configured"
echo ""

echo "[5/6] Building Docker images..."
echo ""
echo "This will take 10-20 minutes depending on your system."
echo "Rust and C++ components need to compile from source."
echo ""

read -p "Start Docker build now? (Y/n): " start_build

if [[ $start_build =~ ^[Nn]$ ]]; then
    echo "Skipping Docker build. Run 'docker compose build' when ready."
else
    echo ""
    echo "Building all services with docker compose..."
    docker compose build

    echo ""
    echo "✓ All Docker images built successfully"
fi

echo ""

echo "[6/6] Setup complete!"
echo ""
echo "=========================================="
echo "  Next Steps"
echo "=========================================="
echo ""
echo "Run the interactive test script to start the 5G Core:"
echo ""
echo "  ./scripts/start.sh"
echo ""
echo "This script provides multiple test modes:"
echo "  1) Quick Start - Use existing images, no rebuilds"
echo "  2) Full Rebuild - Update submodules and rebuild everything"
echo "  3) Update & Build - Update and selective rebuild"
echo "  4) Clean Start - Fresh start with volume cleanup"
echo "  5) Custom - Choose exactly what you need"
echo ""
echo "The script handles:"
echo "  - Git submodule updates (when needed)"
echo "  - Docker image rebuilding (selective or full)"
echo "  - MongoDB provisioning"
echo "  - Service startup"
echo ""
echo "After starting, test with UERANSIM:"
echo "  ./scripts/start-test.sh"
echo ""
echo "Monitor logs:"
echo "  ./scripts/view-logs.sh"
echo ""
echo "=========================================="
echo ""
echo "For troubleshooting, see:"
echo "- INSTALLATION_LOG.md"
echo "- README.md"
echo ""

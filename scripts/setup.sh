#!/bin/bash

set -e

if ! command -v gum &> /dev/null; then
    echo "Installing gum (required for styled output)..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install gum
        else
            echo "Error: Homebrew is not installed. Install it from https://brew.sh/"
            exit 1
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            sudo mkdir -p /etc/apt/keyrings
            curl -fsSL https://repo.charm.sh/apt/gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/charm.gpg
            echo "deb [signed-by=/etc/apt/keyrings/charm.gpg] https://repo.charm.sh/apt/ * *" | sudo tee /etc/apt/sources.list.d/charm.list
            sudo apt-get update && sudo apt-get install -y gum
        else
            echo "Error: gum is required. Install from https://github.com/charmbracelet/gum"
            exit 1
        fi
    else
        echo "Error: gum is required. Install from https://github.com/charmbracelet/gum"
        exit 1
    fi
fi

gum style \
	--foreground 212 --border-foreground 212 --border double \
	--align center --width 50 --margin "1 2" --padding "2 4" \
	'5G CORE' 'Setup Script'

check_command() {
    if command -v $1 &> /dev/null; then
        gum style --foreground 42 "✓ $2 is installed"
        return 0
    else
        gum style --foreground 196 "✗ $2 is not installed"
        return 1
    fi
}

gum style --foreground 86 --bold "[1/6] Checking prerequisites..."
echo ""

prerequisites_met=true

if check_command docker "Docker"; then
    gum style --foreground 244 "  $(docker --version)"
else
    prerequisites_met=false
    gum style --foreground 208 "  Install from: https://www.docker.com/get-started"
fi

if check_command docker-compose "Docker Compose" || check_command "docker compose" "Docker Compose"; then
    gum style --foreground 244 "  $(docker compose version 2>/dev/null || docker-compose --version)"
else
    prerequisites_met=false
    gum style --foreground 208 "  Docker Compose is required"
fi

if check_command git "Git"; then
    gum style --foreground 244 "  $(git --version)"
else
    prerequisites_met=false
    gum style --foreground 208 "  Install from: https://git-scm.com/"
fi

if check_command node "Node.js"; then
    gum style --foreground 244 "  $(node --version)"
    node_version=$(node --version | sed 's/v//' | cut -d. -f1)
    if [ "$node_version" -lt 18 ]; then
        gum style --foreground 208 "  ⚠ Warning: Node.js 18+ is recommended (current: v$node_version)"
    fi
else
    gum style --foreground 208 "  ⚠ Warning: Node.js not installed (required for subscriber provisioning)"
    gum style --foreground 208 "  Install from: https://nodejs.org/ (LTS version 18+)"
fi

echo ""

if [ "$prerequisites_met" = false ]; then
    gum style --foreground 196 "✗ Prerequisites check failed. Please install missing dependencies."
    exit 1
fi

gum style --foreground 42 "✓ All required prerequisites are met"
echo ""

gum style --foreground 86 --bold "[2/6] Initializing git submodules..."
echo ""

if git submodule status | grep -q '^-'; then
    gum spin --spinner dot --title "Initializing submodules..." -- \
        git submodule update --init --recursive
    gum style --foreground 42 "✓ Submodules initialized"
else
    gum style --foreground 42 "✓ Submodules already initialized"
    git submodule status
fi

echo ""

gum style --foreground 86 --bold "[3/6] Setting up UERANSIM..."
echo ""

if [ ! -d "UERANSIM" ]; then
    gum spin --spinner dot --title "Cloning UERANSIM from GitHub..." -- \
        git clone https://github.com/aligungr/UERANSIM.git
    gum style --foreground 42 "✓ UERANSIM cloned"
else
    gum style --foreground 42 "✓ UERANSIM already exists"
fi

echo ""

gum style --foreground 86 --bold "[4/6] Configuring environment..."
echo ""

if [ -f .env ]; then
    gum style --foreground 42 "✓ .env file already exists"
    if gum confirm "Do you want to reconfigure?"; then
        rm .env
    else
        gum style --foreground 244 "Skipping environment configuration"
    fi
fi

if [ ! -f .env ]; then
    if [ ! -f .env.example ]; then
        gum style --foreground 196 "✗ .env.example not found"
        exit 1
    fi

    gum style --foreground 220 "Creating .env from template..."
    cp .env.example .env

    echo ""
    gum style --foreground 244 "MongoDB Atlas configuration required for subscriber provisioning."
    gum style --foreground 244 "If you don't have MongoDB Atlas credentials yet, you can configure this later."
    echo ""

    if gum confirm "Do you have MongoDB Atlas credentials?"; then
        echo ""
        gum style --foreground 220 "Please enter your MongoDB Atlas connection details:"

        mongo_user=$(gum input --placeholder "Username")
        mongo_pass=$(gum input --placeholder "Password" --password)
        mongo_cluster=$(gum input --placeholder "Cluster (e.g., cluster0.xxxxx)")

        mongo_uri="mongodb+srv://${mongo_user}:${mongo_pass}@${mongo_cluster}.mongodb.net/"

        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|MONGODB_URI=.*|MONGODB_URI=${mongo_uri}|" .env
        else
            sed -i "s|MONGODB_URI=.*|MONGODB_URI=${mongo_uri}|" .env
        fi

        gum style --foreground 42 "✓ MongoDB URI configured"
    else
        echo ""
        gum style --foreground 244 "You can configure MongoDB later by editing .env file"
        gum style --foreground 244 "Set MONGODB_URI to your MongoDB Atlas connection string"
    fi
fi

echo ""
gum style --foreground 42 "✓ Environment configured"
echo ""

gum style --foreground 86 --bold "[5/6] Building Docker images..."
echo ""
gum style --foreground 244 "This will take 10-20 minutes depending on your system."
gum style --foreground 244 "Rust and C++ components need to compile from source."
echo ""

if gum confirm "Start Docker build now?" --default=true; then
    echo ""
    gum spin --spinner dot --title "Building all services with docker compose..." -- \
        docker compose build
    echo ""
    gum style --foreground 42 "✓ All Docker images built successfully"
else
    gum style --foreground 244 "Skipping Docker build. Run 'docker compose build' when ready."
fi

echo ""

gum style --foreground 86 --bold "[6/6] Setup complete!"
echo ""

gum style \
    --foreground 42 --border-foreground 42 --border double \
    --align center --width 50 --margin "1 2" --padding "2 4" \
    'Setup Complete!'

echo ""
gum style --foreground 220 --bold "Next Steps"
echo ""

gum style --foreground 255 "Run the interactive test script to start the 5G Core:"
gum style --foreground 86 "  ./scripts/start.sh"
echo ""
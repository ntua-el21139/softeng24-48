#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Install Python dependencies
echo -e "Installing Python dependencies..."
if python3 -m pip install -r requirements.txt; then
    print_status "Python dependencies installed successfully"
else
    print_error "Failed to install Python dependencies"
    exit 1
fi

# Function to install Node.js dependencies for a specific directory
install_node_dependencies() {
    local dir=$1
    if [ -f "$dir/package.json" ]; then
        echo -e "\nInstalling Node.js dependencies in $dir..."
        if cd "$dir" && npm install; then
            print_status "Node.js dependencies in $dir installed successfully"
            cd - > /dev/null
            return 0
        else
            print_error "Failed to install Node.js dependencies in $dir"
            exit 1
        fi
    fi
}

# Install Node.js dependencies in all relevant directories
install_node_dependencies "."
install_node_dependencies "front-end"
install_node_dependencies "back-end"

# Setup environment files
echo -e "\nSetting up environment files..."
if [ ! -f "back-end/.env" ]; then
    if [ -f "back-end/.env.example" ]; then
        cp back-end/.env.example back-end/.env
        print_status "Created back-end/.env from example"
    else
        print_warning "back-end/.env.example not found - you'll need to create .env manually"
    fi
fi

if [ ! -f "cli-client/.env" ]; then
    if [ -f "cli-client/.env.example" ]; then
        cp cli-client/.env.example cli-client/.env
        print_status "Created cli-client/.env from example"
    else
        print_warning "cli-client/.env.example not found - you'll need to create .env manually"
    fi
fi

echo -e "\n${GREEN}Setup completed successfully!${NC}"
echo "You can now start the application with: npm start" 
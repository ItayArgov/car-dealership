#!/bin/bash

# Stop Car Dealership Development Environment
# Kills processes on ports and stops Docker containers

set -e

BACKEND_PORT=3000
FRONTEND_PORT=5173

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🛑 Stopping Car Dealership Development Environment${NC}\n"

# Function to kill process on a port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}⚠️  Killing process on port $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 0.5
        echo -e "${GREEN}✓ Process on port $port killed${NC}"
    else
        echo -e "${GREEN}✓ No process running on port $port${NC}"
    fi
}

# Kill processes
echo -e "${YELLOW}Stopping servers...${NC}"
kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# Stop Docker containers
echo -e "\n${YELLOW}Stopping Docker containers...${NC}"
if docker compose ps -q 2>/dev/null | grep -q .; then
    docker compose down
    echo -e "${GREEN}✓ Docker containers stopped${NC}"
else
    echo -e "${GREEN}✓ No Docker containers running${NC}"
fi

echo -e "\n${GREEN}✅ All services stopped${NC}"

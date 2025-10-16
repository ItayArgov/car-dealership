#!/bin/bash

# Car Dealership Development Environment - tmux Starter
# Starts backend, frontend, and MongoDB in a tmux session

set -e

SESSION_NAME="dealership-dev"
BACKEND_PORT=3000
FRONTEND_PORT=5173
MONGO_PORT=27017
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Car Dealership Development Environment in tmux${NC}"

# Check if tmux is installed
if ! command -v tmux &> /dev/null; then
    echo -e "${RED}❌ tmux is not installed. Install it with: brew install tmux${NC}"
    exit 1
fi

# Check if tmux session exists and kill it
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Killing existing tmux session: $SESSION_NAME${NC}"
    tmux kill-session -t $SESSION_NAME
fi

# Start MongoDB with Docker Compose
echo -e "\n${YELLOW}Starting MongoDB...${NC}"
cd "$PROJECT_ROOT"
docker compose up -d
echo -e "${GREEN}✓ MongoDB started${NC}"

# Wait for MongoDB to be ready
echo -e "${YELLOW}Waiting for MongoDB to be ready...${NC}"
sleep 3

# Create new tmux session
echo -e "\n${GREEN}Creating tmux session: $SESSION_NAME${NC}"

# Window 0: Backend
tmux new-session -d -s $SESSION_NAME -n backend
tmux send-keys -t $SESSION_NAME:0 "cd $PROJECT_ROOT" C-m
tmux send-keys -t $SESSION_NAME:0 "echo '🔧 Starting Backend Server...'" C-m
tmux send-keys -t $SESSION_NAME:0 "pnpm backend dev" C-m

# Window 1: Frontend
tmux new-window -t $SESSION_NAME:1 -n frontend
tmux send-keys -t $SESSION_NAME:1 "cd $PROJECT_ROOT" C-m
tmux send-keys -t $SESSION_NAME:1 "sleep 5" C-m  # Wait for backend to start
tmux send-keys -t $SESSION_NAME:1 "echo '⚛️  Starting Frontend Server...'" C-m
tmux send-keys -t $SESSION_NAME:1 "pnpm frontend dev" C-m

# Window 2: MongoDB logs
tmux new-window -t $SESSION_NAME:2 -n mongodb
tmux send-keys -t $SESSION_NAME:2 "cd $PROJECT_ROOT" C-m
tmux send-keys -t $SESSION_NAME:2 "echo '🍃 MongoDB Logs (docker logs -f):'" C-m
tmux send-keys -t $SESSION_NAME:2 "docker compose logs -f mongodb" C-m

# Window 3: Shell (for running commands)
tmux new-window -t $SESSION_NAME:3 -n shell
tmux send-keys -t $SESSION_NAME:3 "cd $PROJECT_ROOT" C-m
tmux send-keys -t $SESSION_NAME:3 "clear" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '${GREEN}✓ Development environment started!${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  📱 Frontend: http://localhost:$FRONTEND_PORT'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  🔧 Backend:  http://localhost:$BACKEND_PORT'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  🍃 MongoDB:  mongodb://localhost:$MONGO_PORT'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '${YELLOW}Tmux Commands:${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  Ctrl+b 0  → Backend window'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  Ctrl+b 1  → Frontend window'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  Ctrl+b 2  → MongoDB logs'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  Ctrl+b 3  → This shell'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  Ctrl+b d  → Detach session'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '  Ctrl+b &  → Kill window'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m
tmux send-keys -t $SESSION_NAME:3 "echo '${YELLOW}Stop all services: pnpm stop${NC}'" C-m
tmux send-keys -t $SESSION_NAME:3 "echo ''" C-m

# Select the shell window by default
tmux select-window -t $SESSION_NAME:3

# Attach to the session
echo -e "\n${GREEN}✓ Attaching to tmux session${NC}"
echo -e "${YELLOW}💡 Tip: Press Ctrl+b then d to detach. Reattach with: tmux attach -t $SESSION_NAME${NC}\n"
sleep 2
tmux attach-session -t $SESSION_NAME

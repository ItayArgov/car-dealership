#!/bin/bash

# Car Dealership Development Environment - Split Pane Starter
# Starts backend and frontend in current tmux window (split left/right)

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Start MongoDB with Docker Compose
cd "$PROJECT_ROOT"
docker compose up -d

# Wait for MongoDB to be ready
sleep 3

# Check if we're in a tmux session
if [ -z "$TMUX" ]; then
    # Start backend in background
    pnpm backend dev &
    BACKEND_PID=$!

    # Start frontend in foreground
    pnpm frontend dev

    # Cleanup on exit
    kill $BACKEND_PID 2>/dev/null
else
    # Create new window
    tmux new-window -n dev

    # Split the new window vertically (left/right)
    tmux split-window -h

    # Left pane: Frontend
    tmux send-keys "cd $PROJECT_ROOT" C-m
    tmux send-keys "pnpm frontend dev" C-m

    # Right pane: Backend
    tmux select-pane -R
    tmux send-keys "cd $PROJECT_ROOT" C-m
    tmux send-keys "pnpm backend dev" C-m

    # Return focus to left pane
    tmux select-pane -L
fi

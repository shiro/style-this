#!/usr/bin/env nix-shell
#!nix-shell -i bash

# Test script to verify CSS source maps are working

cd examples/vite-solid

# Start dev server in background
echo "Starting dev server..."
pnpm vinxi dev > /tmp/dev-server.log 2>&1 &
DEV_PID=$!

# Wait for server to start
echo "Waiting 5 seconds for server to start..."
sleep 5

# Fetch page and output head section
echo "Fetching page and showing <head> section:"
echo "---"
curl -s http://localhost:3000 | sed -n '1,/<\/head>/p'

# Clean up
kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null

echo ""
echo "---"
echo "Dev server stopped"

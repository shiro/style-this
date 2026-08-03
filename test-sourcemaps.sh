#!/usr/bin/env bash
set -e

# Kill any existing node processes
pkill -9 node 2>/dev/null || true
sleep 1

test_example() {
  local example_name=$1
  local example_path=$2
  local component_name=$3
  local dev_command=$4

  echo ""
  echo "=========================================="
  echo "Testing: $example_name"
  echo "=========================================="

  echo "Starting dev server at $example_path..."
  nix-shell --run "zsh -ic 'cd $example_path && $dev_command'" 2>&1 | grep -E '(debug|Local:)' &
  SERVER_PID=$!

  echo "Waiting for server to be ready..."
  for i in {1..60}; do
    if curl -s http://localhost:3000/ > /dev/null 2>&1; then
      echo "Server is ready after $i seconds!"
      sleep 2  # Extra time for module graph to be ready
      break
    fi
    echo "  Waiting... ($i/60)"
    sleep 1
  done

  HYDRATED_HTML=$(chromium --headless --disable-gpu --virtual-time-budget=5000 --dump-dom 'http://localhost:3000/' 2>/dev/null)

  echo ""
  echo "=== Client-side CSS module source map (from /@id/__x00__...) ==="
  curl -s "http://localhost:3000/@id/__x00__virtual:style-this:$example_path/src/$component_name.tsx.css" 2>/dev/null | grep -o 'sourceMappingURL=data:application/json;base64,[^"]*' | sed 's/.*base64,//' | base64 -d 2>/dev/null | python3 -c "
import sys, json
try:
     m = json.load(sys.stdin)
     print('Sources:', m['sources'])
     if '.tsx' in str(m['sources']) and '.tsx.css' not in str(m['sources']):
         print('✓ Sourcemaps point to .tsx files!')
     else:
         print('✗ Sourcemaps still point to virtual .css files')
except:
     print('✗ No sourcemap found or parse error')
"

  echo ""
  echo "=== First injected sourcemap from hydrated HTML ==="
  FIRST_SOURCEMAP=$(echo "$HYDRATED_HTML" | grep -oP 'sourceMappingURL=data:application/json;base64,\K[^*/\s]+' | head -1)
  if [ -n "$FIRST_SOURCEMAP" ]; then
    echo "$FIRST_SOURCEMAP" | base64 -d 2>/dev/null | python3 -c "
import sys, json
try:
     m = json.load(sys.stdin)
     print('Sources:', m['sources'])
     if '.tsx' in str(m['sources']) and '.tsx.css' not in str(m['sources']):
         print('✓ Sourcemaps point to .tsx files!')
     else:
         print('✗ Sourcemaps still point to virtual .css files')
except:
     print('✗ No sourcemap found or parse error')
"
  else
    echo "✗ No sourcemap found in hydrated HTML"
  fi

  echo ""
  echo "Cleaning up..."
  pkill -9 node 2>/dev/null || true
  sleep 1
}

# Test Vite React
test_example \
  "Vite React" \
  "/home/shiro/project/style-this/examples/vite-react" \
  "Counter" \
  "web dev"

# Test Solid Start 2.0
test_example \
  "Solid Start 2.0" \
  "/home/shiro/project/style-this/examples/vite-solid-start-2" \
  "Counter" \
  "web dev"

echo ""
echo "=========================================="
echo "Done with all tests"
echo "=========================================="

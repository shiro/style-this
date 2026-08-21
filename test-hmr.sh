#!/usr/bin/env bash
set -e

pkill -f "node /home/shiro/project/style-this/examples/vite-solid-start-2" || true

cd ~/project/style-this
nix-shell --run 'web build' > /dev/null

clear

(cd ~/project/style-this/examples/vite-solid-start-2; web dev:atomic) &

#SERVER_PID=$!
#trap 'kill -9 $SERVER_PID 2>/dev/null || true' EXIT
trap 'pkill -f "node /home/shiro/project/style-this/examples/vite-solid-start-2"'

sleep 2


sed -i -E 's/(export const counterColor = ")(grey|pink)(")/\1grey\3/' examples/vite-solid-start-2/src/components/Counter.tsx

echo done
sleep 7

sed -i -E 's/(export const counterColor = ")(grey|pink)(")/\1pink\3/' examples/vite-solid-start-2/src/components/Counter.tsx

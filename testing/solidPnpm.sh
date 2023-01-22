#!/bin/bash

# Stop on error
set -e

rm -rf ./current-test
pnpm create solid current-test
cd current-test
pnpm install
cp ../components/solidCounter.tsx ./src/components/Counter.tsx
node ../../dist/index.js init my-rust
echo "node ../dist/index.js watch my-rust"
pnpm run dev
echo ./solidUninstall.sh
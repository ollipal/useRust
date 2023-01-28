#!/bin/bash

# Stop on error
set -e

rm -rf ./current-test
cd ..
npm run build
cd testing
pnpm create solid current-test
cd current-test
pnpm install
cp ../components/solidCounter.tsx ./src/components/Counter.tsx
node ../../dist/index.js init my-rust
cp ../viteConfigs/viteConfigSolid.ts ./vite.config.ts
echo "node ../dist/index.js watch my-rust"
pnpm run dev
echo ./solidUninstall.sh
#!/bin/bash

# Stop on error
set -e

rm -rf ./current-test
cd ..
npm run build
cd testing
npm init solid@latest current-test
cd current-test
npm install
cp ../components/solidCounter.tsx ./src/components/Counter.tsx
node ../../dist/index.js init my-rust -y
cp ../viteConfigs/viteConfigSolid.ts ./vite.config.ts
echo "node ../dist/index.js watch my-rust"
npm run dev
echo ./solidUninstall.sh
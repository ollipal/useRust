#!/bin/bash

# Stop on error
set -e

rm -rf ./current-test
cd ..
npm run build
cd testing
pnpm create vite current-test
cd current-test
pnpm install
cp ../components/reactApp.tsx ./src/App.tsx
node ../../dist/index.js init my-rust -y
cp ../viteConfigs/viteConfigReact.ts ./vite.config.ts
pnpm run dev
#
cat package.json
node ../../dist/index.js remove my-rust
cat package.json
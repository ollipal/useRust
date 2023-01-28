#!/bin/bash

# Stop on error
set -e

rm -rf ./current-test
cd ..
npm run build
cd testing
npm create vite@latest current-test
cd current-test
npm install
cp ../components/reactApp.tsx ./src/App.tsx
node ../../dist/index.js init my-rust -y --verbose
cp ../viteConfigs/viteConfigReact.ts ./vite.config.ts
npm run dev
#
cat package.json
node ../../dist/index.js remove my-rust
cat package.json
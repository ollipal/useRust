#!/bin/bash

# Create an empty "yarn.lock" to useRust root first!

# Stop on error
set -e

rm -rf ./current-test
cd ..
npm run build
cd testing
yarn set version berry
yarn create vite current-test
cd current-test
touch yarn.lock
yarn
cp ../components/reactApp.tsx ./src/App.tsx
node ../../dist/index.js init my-rust -y
cp ../viteConfigs/viteConfigReact.ts ./vite.config.ts
yarn dev
#
cat package.json
node ../../dist/index.js remove my-rust
cat package.json
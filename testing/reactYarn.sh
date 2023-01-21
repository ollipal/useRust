#!/bin/bash

# Create an empty "yarn.lock" to useRust root first!

# Stop on error
set -e

rm -rf ./current-test
yarn set version berry
yarn create vite current-test
cd current-test
touch yarn.lock
yarn
cp ../components/reactApp.tsx ./src/App.tsx
node ../../dist/index.js init my-rust
yarn dev
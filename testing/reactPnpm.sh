#!/bin/bash

# Stop on error
set -e

rm -rf ./current-test
pnpm create vite current-test
cd current-test
pnpm install
cp ../components/reactApp.tsx ./src/App.tsx
node ../../dist/index.js init my-rust
pnpm run dev
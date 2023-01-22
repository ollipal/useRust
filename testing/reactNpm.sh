#!/bin/bash

# Stop on error
set -e

rm -rf ./current-test
npm create vite@latest current-test
cd current-test
npm install
cp ../components/reactApp.tsx ./src/App.tsx
node ../../dist/index.js init my-rust -y
npm run dev
#
cat package.json
node ../../dist/index.js uninstall my-rust
cat package.json
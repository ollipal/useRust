#!/bin/bash

# Stop on error
set -e

rm -rf ./current-test
npm init solid@latest current-test
cd current-test
npm install
cp ../components/solidCounter.tsx ./src/components/Counter.tsx
node ../../dist/index.js init my-rust -y
echo "node ../dist/index.js watch my-rust"
npm run dev

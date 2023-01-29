#!/bin/bash

# Stop on error
set -e

cd ..
npm run build
cd testing
cd current-test
node ../../../useRust/dist/index.js watch my-rust --no-gitignore
cd ..
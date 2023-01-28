#!/bin/bash

# Stop on error
set -e

cd current-test
node ../../../useRust/dist/index.js watch my-rust --no-gitignore
cd ..
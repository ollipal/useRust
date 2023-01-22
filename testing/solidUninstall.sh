#!/bin/bash

# Stop on error
set -e

cd current-test
cat package.json
node ../../dist/index.js uninstall my-rust
cat package.json
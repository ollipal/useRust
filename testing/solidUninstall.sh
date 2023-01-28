#!/bin/bash

# Stop on error
set -e

cd current-test
cat package.json
node ../../dist/index.js remove my-rust
cat package.json
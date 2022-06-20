#!/usr/bin/env bash

# Test that we can build for node and run the compiled Js code
# in a node executable with no loaders registered
# E.g.: npm run test:build:node

pm=`npm get package_manager`;

pm=${pm:-npm}

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

echo
echo "# Using package manager “$pm”"
echo

set -Eeuo pipefail

rm -rf dist
$pm run build:node
node dist/src/devBin/should-import.js

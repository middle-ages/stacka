#!/usr/bin/env bash

# Test that we can build for node and run the
# compiled Js code using the ts-node/tsconfig
# loader
# E.g.: npm run test:build:node:runtime

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
$pm run build:node:tsc
$pm run js -- dist/src/devBin/should-import.js

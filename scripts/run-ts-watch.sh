#!/usr/bin/env bash

# Run a given typescript file in watch mode
# E.g.: npm run ts:watch -- src/devBin/should-run.ts

pm=`npm get package_manager`;

pm="${pm:-npm}"

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

echo
echo "# Using package manager “$pm”"
echo

source="${1:-src/devBin/should-run.ts}"

echo
echo "# Running “$source”"
echo

set -Eeuo pipefail


NODE_NO_WARNINGS=1 nodemon --exec 'node --loader ts-node/esm' "$source"

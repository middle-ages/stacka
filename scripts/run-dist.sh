#!/usr/bin/env bash

# Run a compiled Js file from the dist/ folder
# E.g.: npm run js -- dist/src/devBin/should-import.js

pm=`npm get package_manager`;

pm=${pm:-npm}

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

echo
echo "# Using package manager “$pm”"
echo

source=${1:-src/devBin/should-run.ts}

echo
echo "# Running “$source”"
echo

set -Eeuo pipefail

export TS_NODE_BASEURL=dist

node -r tsconfig-paths/register "$source"

echo
echo "# Done."
echo

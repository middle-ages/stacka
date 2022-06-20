#!/usr/bin/env bash

# Create a depenedncy free zero runtime Node.js
# distribution ready to be run using the `node`
# executable
# E.g.: npm run build:node

pm=`npm get package_manager`;

pm=${pm:-npm}

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

set -Eeuo pipefail

$pm build:node:tsc
$pm build:node:fix
$pm build:node:types

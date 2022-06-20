#!/usr/bin/env bash

# Create a depenedncy free zero runtime Node.js
# distribution ready to be run using the `node`
# executable
# E.g.: npm run build

pm=`npm get package_manager`;

pm=${pm:-npm}

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

set -Eeuo pipefail

$pm build:compile
$pm build:fix
$pm build:types

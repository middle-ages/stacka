#!/usr/bin/env bash

# Run all build targets both browser and node
# E.g.: npm build

pm=`npm get package_manager`;

pm=${pm:-npm}

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

set -Eeuo pipefail

$pm build:node
$pm build:browser

#!/usr/bin/env bash

# Run all non-destructive code linting tasks
# E.g. npm run lint

pm=`npm get package_manager`;

pm=${pm:-npm}

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

set -Eeuo pipefail

$pm lint:code
$pm lint:doc

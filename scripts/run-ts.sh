#!/usr/bin/env bash

# Run a given typescript file
# E.g.: npm run ts -- src/devBin/should-run.ts

pm=`npm get package_manager`;

pm=${pm:-npm}

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

source=${1:-src/devBin/should-run.ts}

set -Eeuo pipefail

# clean the args added by ts-node

ts-node-esm $source $@

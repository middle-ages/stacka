#!/usr/bin/env bash

# Test that we can ESM import in the REPL
# E.g.: npm run test:repl

pm=`npm get package_manager`;

pm=${pm:-npm}

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

echo
echo "# Using package manager “$pm”"
echo

set -Eeuo pipefail

import="import { toBinary } from 'src/eg/pure'"
program="'12d=' + toBinary(12) + 'b'"

echo "$import;$program" | $pm run repl
echo

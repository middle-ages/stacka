#!/usr/bin/env bash

# Uses tsconfig.json path mappings to fix all `require`s under the compile
# output dir dist. After this is run, `Node.js` should be able to run any
# script in the project with no runtime requirements or resolver configuration.
#
# Fixes the following issues with tsc compiled Js output in a Node.js commonjs
# project:
#
#
# # 1. Apply tsconfig mappings
#
# Applies tsconfig.json path mappings so that mapped paths become relative
# paths. For example assuming the tsconfig mapping:
#
# * `util/* ⇒ ./src/util/*`,
# * `baseUrl = “.”` same dir as tsconfig.json, one above `src`
#
# Then a require of `util/foo` in a file `src/bar/baz.ts` will be replaced
# with `../../util/foo`.
#
#
#
# # 2. Replace implicit index paths with explicit reference
#
# Replaces implicit index imports with explicit imports. For example, replaces
# `./foo/bar`, where `bar` is a directory, with `./foo/bar/index`
#
#
#
# # 3. Adds `.js` extension to `require`s of relative imports
#
# For example replaces `./foo/bar/index` with `./foo/bar/index.js`.
#
#
# Run using:
# npm run build:node:fix

pm=`npm get package_manager`;

pm=${pm:-npm}

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

set -Eeuo pipefail

$pm build:fix:require
scripts/add-js-ext-to-dist.sh







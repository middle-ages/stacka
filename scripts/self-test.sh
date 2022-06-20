#!/usr/bin/env bash

# Tries to test the project works by running almost every npm target
# E.g. npm run test:self

pm=`npm get package_manager`;

pm=${pm:-npm}

if [ "$pm" = "undefined" ]; then
  pm=npm
fi

echo "#"
echo "# Using package manager “$pm”"
echo "#"

set -Eeuo pipefail

echo "#"
echo "#🧹 Cleaning…"
echo "#"

$pm run clean

echo "#"
echo "# Clean."
echo "# ⚙️ Installing…"
echo "#"

$pm install

echo "#"
echo "#  𝟏. 🗸  Installation OK."
echo "#  𝟐. 👟 Running Typescript code..."
echo "#"

$pm run test:should:run

echo "#"
echo "#  𝟐. 🗸  TypeScript runs."
echo "#  𝟑. 👟 Checking Typescript imports..."
echo "#"

$pm run ts -- src/devBin/should-import.ts

echo "#"
echo "#  𝟑. 🗸  Imports and path mapping work."
echo "#  𝟒. 👟 Running REPL..."
echo "#"

echo "'1+1='+(1+1)" | $pm run repl

echo
echo "#"
echo "#  𝟒. 🗸  REPL works."
echo "#  𝟓.👟 Running REPL with imports..."
echo "#"

$pm run test:repl

echo "#"
echo "#  𝟓. 🗸 REPL importing works."
echo "#  𝟔. 👟 Compiling..."

$pm compile

echo "#"
echo "#  𝟔. 🗸 Compile OK."
echo "#  𝟕. 👟 Linting..."

$pm lint

echo "#"
echo "#  𝟕. 🗸 Lint OK."
echo "#  𝟖. 👟 Unit testing..."

$pm test:unit

echo "#"
echo "#  𝟖. 🗸 Unit tests OK."
echo "#  𝟗. 👟 Test Node.js build..."

$pm test:build:node

echo "#"
echo "#  𝟗. 🗸 Node.js build OK."
echo "# 𝟏𝟎. 👟 Run Js compiled output..."

$pm run js -- dist/src/devBin/should-import.js

echo "#"
echo "# 𝟏𝟎. 🗸 Run Node.js compiled output OK."
echo "#"
echo "# ✅ Pass."
echo "#"

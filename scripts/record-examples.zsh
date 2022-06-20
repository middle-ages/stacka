#!/usr/bin/env zsh

set -e

# Run all example scripts and save their output to `test-data/integration`
# directory. Useful for usage as a regression test oracle
#
# Example: npm run test:record-examples

local dir="test-data/integration"
mkdir -p "$dir/reference/border" "$dir/reference/glyph" "$dir/eg"

echo "# Starting recording...";

export FORCE_COLOR=1

time for n (${(f)}src/bin/(reference|eg)/**/*.ts) { tsx "$n" > "test-data/integration/${n:h:s/src\/bin\//}/${n:t}.out" }

echo "# ✅ Done recording to “$dir/”";


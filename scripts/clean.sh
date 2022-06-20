#!/usr/bin/env bash

set -Eeuo pipefail

rm -rf dist \
       node_modules \
       test-results \
       package-lock.json \
       pnpm-lock.yaml


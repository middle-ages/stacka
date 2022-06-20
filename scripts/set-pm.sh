#!/usr/bin/env bash

# Set the package manger npm user configuration
# E.g. to set `npm`:
# scripts/set-pm.sh npm

pm=${1-npm}

set -Eeuo pipefail

npm set package_manager $pm

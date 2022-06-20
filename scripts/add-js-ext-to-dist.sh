#!/usr/bin/env bash

# Add .js file extension to all relative `require`s under the compile output
# dir dist/

find dist -type f -exec sed -i -e "s/require('\\.\\(.\\+\\)');/require('\\.\\1.js'\\)/g" {} \;
find dist -type f -exec sed -i -e 's/require("\.\(.\+\)");/require("\.\1.js"\)/g' {} \;

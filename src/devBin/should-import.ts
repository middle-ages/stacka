#!/usr/bin/env node

import { toBinary } from 'src/eg/pure';

/**
 * Run as part of the self-test to ensure project configuration allows import
 * of typescript files and the path mapping works.
 */

console.log(toBinary(14));

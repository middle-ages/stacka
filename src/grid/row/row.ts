import * as chopAtMost from './chopAtMost';
import * as chopAtLeast from './chopAtLeast';
import * as chopMin from './chopMin';
import * as zipWidth from './zipWidth';
import * as instances from './instances';
import * as align from './align';
import * as types from './types';
import * as paint from './paint';
import * as stack from './stack';

export type { Row, SplitResult } from './types';

export const row = {
  ...chopAtMost,
  ...chopAtLeast,
  ...chopMin,
  ...zipWidth,
  ...instances,
  ...align,
  ...types,
  ...paint,
  ...stack,
} as const;

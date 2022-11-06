import { line } from './named/line';
import * as elbow from './named/elbow';
import * as classify from './named/classify';
import * as other from './named/other';
import * as types from './named/types';

export type { BasicGroup, ElbowGroup, LineGroup } from './named/types';

export const named = {
  line,
  dash: line.dash,
  ...elbow,
  ...classify,
  ...elbow,
  ...other,
  ...types,
} as const;

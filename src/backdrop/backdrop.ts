import { buildBackdrop } from 'src/backdrop/types';
import * as types from './types';
import * as instances from './instances';
import * as paint from './paint';
import * as named from './named';
import * as lens from './lens';

export type { Backdrop, Projection, Stretch, Repeat, Center } from './types';

const fns = {
  ...types,
  ...instances,
  ...paint,
  ...named,
  ...lens,
} as const;

export type backdrop = typeof buildBackdrop & typeof fns;

export const backdrop = buildBackdrop as backdrop;

Object.assign(backdrop, fns);

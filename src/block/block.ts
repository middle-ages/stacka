import * as build from './build';
import * as instances from './instances';
import * as lens from './lens';
import * as paint from './paint';
import * as rect from './rect';
import * as types from './types';

export type { Block, BlockArgs } from './types';
export type { Lenses, LensKey } from './lens';

const fns = {
  ...types,
  ...build,
  ...rect,
  ...lens,
  ...paint,
  ...instances,
  ...rect.withRect,
} as const;

export type block = typeof build.build & typeof fns;

export const block = build.build as block;

Object.assign(block, fns);

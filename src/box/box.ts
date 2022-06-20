import * as nodes from './nodes';
import * as align from './align';
import * as block from './block';
import { buildBox } from './build';
import * as build from './build';
import * as paint from './paint';
import * as place from './place';
import { exportRect } from './rect';
import * as move from './move';
import * as cat from './cat';
import * as debug from './report';
import * as margins from './margins';

export * from './types';

const fns = {
  ...build,
  ...block,
  ...exportRect,
  ...nodes,
  ...align,
  ...move,
  ...place,
  ...paint,
  ...cat,
  ...margins,
  debug,
} as const;

export type box = typeof buildBox & typeof fns;

export const box = buildBox as box;

Object.assign(box, fns);

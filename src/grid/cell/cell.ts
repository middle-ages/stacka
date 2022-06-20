import * as build from './build';
import * as lens from './lens';
import * as ops from './ops';
import * as types from './types';
import * as instances from './instances';

import { parseRow } from './build';
import { lenses } from './lens';

export type {
  Cell,
  CellType,
  Char,
  Cont,
  None,
  Wide,
  Styled,
  BaseCell,
} from './types';

const fns = {
  ...types,
  ...build,
  ...lens,
  ...lenses,
  ...ops,
  ...instances,
} as const;

export type cell = typeof parseRow & typeof fns;

export const cell = parseRow as cell;

Object.assign(cell, fns);

import { apply as add, named } from './apply';
import * as build from './build';
import * as backdrop from './backdrop';
import * as edge from './edge';
import * as mask from './mask';
import * as ops from './ops';
import * as part from './part';
import * as sets from './sets';
import { borderNames } from './types';
import * as variants from './variants';

export * from './types';
export type { NamedSets, SetName } from './sets';
export type { Mask } from './mask';

const fns = {
  add,
  names: borderNames,
  ...backdrop,
  ...build,
  ...edge,
  ...mask,
  ...named,
  ...ops,
  ...part,
  ...sets,
  ...variants,
};

export type border = typeof add & typeof fns;

export const border = add as border;

Object.assign(border, fns);

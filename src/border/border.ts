import { apply, named } from './apply';
import * as build from './build';
import * as backdrop from './backdrop';
import * as edge from './edge';
import * as mask from './mask';
import * as ops from './ops';
import * as part from './part';
import { sets } from './sets';
import * as types from './types';
import * as variants from './variants';

export type {
  BackdropParts,
  Border,
  BorderEdge,
  BorderLines,
  BorderName,
  CellParts,
  CharParts,
  DashBorderName,
  EdgeParts,
  NoDashBorderName,
} from './types';
export type { sets } from './sets';
export type { Mask } from './mask';

const fns = {
  apply,
  names: types.borderNames,
  ...types,
  ...backdrop,
  ...build,
  ...edge,
  ...mask,
  ...ops,
  ...part,
  ...variants,
  ...named,
  sets,
};

export type border = typeof apply & typeof fns;

export const border = apply as border;

Object.assign(border, fns);

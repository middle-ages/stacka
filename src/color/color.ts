import * as builders from './build';
import * as convert from './convert';
import { exportNamed } from './named';
import * as ops from './ops';
import { fg } from './ops';
import * as palette from './palette';
import * as hexExports from './hex/ops';
import * as lens from './lens';
import * as blend from './blend';
import * as instances from './instances';
import * as types from './types';

export * from './types';
export * from './hex/types';

export { hex } from './hex/ops';

const fns = {
  ...types,
  ...builders,
  ...lens,
  ...convert,
  ...exportNamed,
  ...ops,
  ...palette,
  ...blend,
  ...instances,
  ...hexExports,
  hex: hexExports.hex,
};

export type {
  ColorPair,
  Color,
  LayerColor,
  MaybeColor,
  NamedColor,
} from './named';

export type color = typeof fg & typeof fns;

export const color = fg as color;

Object.assign(color, fns);

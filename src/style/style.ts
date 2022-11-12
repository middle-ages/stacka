export * from './types';
export * from './ops';
export * from './lens';
export * from './instances';
export * from './build';
export * as deco from './deco';
export * from './blend';

export type { Deco, DecoList, Decoration } from './deco';

import { fgLens, bgLens } from './lens';
import { ops } from './ops';

export const fg = { ...fgLens, ...ops.fg },
  bg = { ...bgLens, ...ops.bg };

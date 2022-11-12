export * from './types';
export * from './stack';
export * from './instances';
export * from './lens';
export * from './ops';
export * from './paint';
export * from './parse';
export * from './packed';
export * from './build';
export * from './rune';
export * from './copy';

import { fgLens, bgLens } from './lens';
import { fgOps, bgOps } from './ops';

export type { PackedType, CellType } from './type';
export type { PrevStyle } from './paint';

export const fg = { ...fgLens, ...fgOps },
  bg = { ...bgLens, ...bgOps };

import * as build from './build';
import * as lens from './lens';
import * as instances from './instances';
import * as types from './types';
import * as ansi from './paint';
import { buildStyle } from './build';

export type { Style, Decoration, DecoMap, MaybeStyle } from './types';
export type { StyleLens, StyleLensKey } from './lens';

const fns = {
  ...types,
  ...build,
  ...lens,
  ...ansi,
  ...instances,
} as const;

export type style = typeof buildStyle & typeof fns;

export const style = buildStyle as style;

Object.assign(style, fns);

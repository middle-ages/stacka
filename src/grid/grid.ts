import { style } from './style/style';
import { cell } from './cell/cell';
import { row } from './row/row';
import * as types from './types';
import * as align from './align';
import * as instances from './instances';
import * as ops from './ops';

export type { Grid } from './types';
export type { Style, Decoration, StyleLens, StyleLensKey } from './style/style';
export type {
  Cell,
  CellType,
  Char,
  Cont,
  None,
  Wide,
  Styled,
  BaseCell,
} from './cell/cell';
export type { Row, SplitResult } from './row/row';

export { style, cell, row };

export const grid = {
  style,
  cell,
  row,
  ...types,
  ...align,
  ...instances,
  ...ops,
} as const;

import { function as FN } from 'fp-ts';
import { backdrop } from 'src/backdrop';
import { Grid, grid } from 'src/grid';
import { BinaryC, Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import * as BLE from './lens';
import { withRect as RCT } from './rect';
import { Block } from './types';

export const alignToSize: Unary<Block, Endo<Grid>> = b =>
  FN.pipe(b, RCT.size.get, FN.pipe(b, BLE.align.get, grid.align));

/** Render grid and align results inside a rectangle */
export const paint: Unary<Block, Grid> = b => {
  const size = RCT.size.get(b);

  const grids: Pair<Grid> = [
    FN.pipe(size, FN.pipe(b, BLE.backdrop.get, backdrop.paint)),
    FN.pipe(b.grid, alignToSize(b)),
  ];

  return FN.pipe(grids, FN.pipe(b, BLE.blend.get, grid.stack));
};

export const asStringsWith: BinaryC<string, Block, string[]> = s =>
  FN.flow(paint, grid.asStringsWith(s));

export const asStrings: Unary<Block, string[]> = asStringsWith(' ');

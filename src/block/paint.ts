import { function as FN } from 'fp-ts';
import { withSnd } from 'fp-ts-std/Tuple';
import * as BD from 'src/backdrop';
import * as GR from 'src/grid';
import { Grid } from 'src/grid';
import { BinaryC, Unary } from 'util/function';
import * as BLE from './lens';
import { withRect as RCT } from './rect';
import { Block } from './types';

/** Render grid and align results inside a rectangle */
export const paint: Unary<Block, Grid> = b => {
  const [align, size, backdrop] = [
    BLE.align.get(b),
    RCT.size.get(b),
    BLE.backdrop.get(b),
  ];

  const grid = GR.alignGrid(align, size)(b.grid);

  if (BD.isEmpty(backdrop)) return grid;

  return FN.pipe(
    size,
    BD.paint(backdrop),
    withSnd(grid),
    FN.pipe(b, BLE.blend.get, GR.stackAlign([align, size])),
  );
};

export const asStringsWith: BinaryC<string, Block, string[]> = s =>
  FN.flow(paint, GR.paintWith(s));

export const asStrings: Unary<Block, string[]> = asStringsWith(' ');

import * as fc from 'fast-check';
import { array as AR, function as FN } from 'fp-ts';
import * as CE from 'src/cell';
import { Cell } from 'src/cell';
import { narrowOrNoneArb } from 'src/cell/tests/helpers';
import { Size, size as SZ } from 'src/geometry';
import { head } from 'util/array';
import { Tuple4 } from 'util/tuple';
import { assert, test } from 'vitest';
import * as PA from '../paint';
import * as TY from '../types';
import { Grid, unpack } from '../types';

export * from 'src/cell/tests/helpers';

export type CellArb = fc.Arbitrary<Cell>;

export const gridEq = (fst: Grid, snd: Grid): void =>
  assert.deepEqual(unpack(fst), unpack(snd));

export const plainGrid = FN.flow(
  FN.pipe(CE.plainChar, AR.map, AR.map),
  TY.pack,
);

export const narrowRedCell = FN.pipe('x', CE.fgChar(0xff_00_00_ff), head),
  narrowRed1x1 = TY.oneCell(narrowRedCell);

export const sizeArb: fc.Arbitrary<Size> = fc.record({
  width: fc.nat(6),
  height: fc.nat(6),
});

// given a number n returns array len n gen of non or narrow cells
const narrowOrNoneTuple = <N extends number>(n: N) =>
  fc.tuple(
    // getting around the 21 overloads of fc.tuple
    ...(AR.replicate(n, narrowOrNoneArb) as unknown as Tuple4<CellArb>),
  ) as unknown as fc.Arbitrary<Cell[]>;

export const narrowGridArb: fc.Arbitrary<Grid> = sizeArb.chain(size =>
  FN.pipe(size, SZ.area, narrowOrNoneTuple)
    .map(AR.chunksOf(size.width))
    .map(TY.pack),
);

export const paint = PA.paintWith('.');

export const testPaint = (name: string, actual: Grid, expect: string[]) =>
  test(name, () => assert.deepEqual(PA.paintWith('.')(actual), expect));

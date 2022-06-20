import { array as AR, function as FN } from 'fp-ts';
import { addAround } from 'util/array';
import { BinaryC, Endo, Unary } from 'util/function';
import { halfInt } from 'util/number';
import { nLines } from 'util/string';
import { Pair, pairMap } from 'util/tuple';
import { Size } from '../geometry/size';
import { matchVAlign, VAlign } from './types';

/** Expand given column up & down by the given number pair */
const expandColumn: Unary<Pair<number>, Endo<string[]>> = FN.flow(
  pairMap(nLines),
  addAround,
);

/** Shrink given column from both sides by given number pair */
const shrinkColumn: Unary<Pair<number>, Endo<string[]>> =
  ([left, right]) =>
  s =>
    FN.pipe(s, AR.dropLeft(-1 * left), AR.dropRight(-1 * right));

export const alignColumn: BinaryC<VAlign, Size, Endo<string[]>> =
  align => size => column => {
    const hΔ = size.height - column.length;

    if (!hΔ) return column;

    const around: Pair<number> = FN.pipe(
      align,
      matchVAlign([0, hΔ], halfInt(hΔ), [hΔ, 0]),
    );

    return FN.pipe(
      column,
      FN.pipe(around, hΔ > 0 ? expandColumn : shrinkColumn),
    );
  };

export const alignColumns: BinaryC<VAlign, Size, Endo<string[][]>> = align =>
  FN.flow(alignColumn(align), AR.map);

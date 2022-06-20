import { array as AR, function as FN, option as OP } from 'fp-ts';
import { dropLeft, dropRight } from 'fp-ts-std/String';
import { RowList } from 'src/types';
import { BinaryC, Endo, Unary } from 'util/function';
import { halfInt } from 'util/number';
import { around, Char, MaybeChar, nChars, orSpace } from 'util/string';
import { Pair, pairMap } from 'util/tuple';
import { deltaMaxWidth, getWidth, Size } from '../geometry/size';
import { HAlign, matchHAlign } from './types';

// Expand given row to the left & right by the given number pair respectively.
// Expanded area is filled with the given character.
const expandRow: BinaryC<Char, Pair<number>, Endo<string>> = c =>
  FN.flow(FN.pipe(c, nChars, pairMap), FN.tupled(around));

// Shrink given row from both sides by given number pair
const shrinkRow: Unary<Pair<number>, Endo<string>> =
  ([left, right]) =>
  s =>
    FN.pipe(s, dropLeft(-1 * left), dropRight(-1 * right));

const alignRowWith =
  (c: Char): BinaryC<HAlign, Size, Endo<string>> =>
  align =>
  size =>
  row => {
    const wΔ = FN.pipe(row, FN.pipe(size, getWidth, deltaMaxWidth));

    if (!wΔ) return row;

    const around: Pair<number> = FN.pipe(
      align,
      matchHAlign([0, wΔ], halfInt(wΔ), [wΔ, 0]),
    );

    return FN.pipe(row, (wΔ > 0 ? expandRow(c) : shrinkRow)(around));
  };

export const alignRowsWith = (
  c: MaybeChar,
  align: HAlign,
): Unary<Size, Endo<RowList>> =>
  FN.flow(FN.pipe(align, FN.pipe(c, orSpace, alignRowWith)), AR.map);

/**
 * Convert a list of rows of various widths to a list of rows at the given
 * width.
 *
 * Width is added to short rows according to given horizontal alignment.
 */
export const alignRows: BinaryC<HAlign, Size, Endo<RowList>> = align =>
  alignRowsWith(OP.none, align);

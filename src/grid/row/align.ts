import { array as AR, function as FN } from 'fp-ts';
import { HAlign, matchHAlign } from 'src/align';
import { BinaryC, Endo, Unary } from 'util/function';
import { halfInt } from 'util/number';
import { Pair } from 'util/tuple';
import { chopAtMostLeft, chopAtMostRight } from './chopAtMost';
import { emptyN, Row } from './types';

export const maxRowWidth: Unary<Row[], number> = rows =>
  Math.max(...FN.pipe(rows, AR.map(AR.size)));

/**
 * Expand given row to the left & right, with empty cells, according to given
 * number pair
 */
export const expandRow: Unary<Pair<number>, Endo<Row>> =
  ([left, right]) =>
  row =>
    [...emptyN(left), ...row, ...emptyN(right)];

/**
 * Drop exactly the given number of cells from row left, chopping up wide
 * characters and replacing with empty cells as required
 */
export const dropLeftWidth: Unary<number, Endo<Row>> = drop => row => {
  const { right, delta } = FN.pipe(row, chopAtMostLeft(drop));
  return [...right, ...emptyN(delta)];
};

/** Same as `dropLeftWidth` but from the right side of the row */
export const dropRightWidth: typeof dropLeftWidth = drop => row => {
  const { left, delta } = FN.pipe(row, chopAtMostRight(drop));
  return [...emptyN(delta), ...left];
};

/**
 *  Shrink given row from both sides by given number pair.
 *  We always shrink to exact width given. If this is impossible, because of
 *  double width characters for example, we fill with empty cells.
 */
export const shrinkRow: Unary<Pair<number>, Endo<Row>> = ([left, right]) =>
  FN.flow(dropLeftWidth(Math.abs(left)), dropRightWidth(Math.abs(right)));

/** Resize row to given width according to given horizontal alignment */
export const alignRow: BinaryC<HAlign, number, Endo<Row>> =
  align => width => row => {
    const wΔ = width - row.length;
    if (!wΔ) return row;

    const around: Pair<number> = FN.pipe(
      align,
      matchHAlign([0, wΔ], halfInt(wΔ), [wΔ, 0]),
    );

    return FN.pipe(row, FN.pipe(around, wΔ > 0 ? expandRow : shrinkRow));
  };

/**
 * Convert a list of rows of various widths to a list of rows at the given
 * width, where width is added/removed to short/long rows according to given
 * horizontal alignment
 */
export const alignRows: BinaryC<HAlign, number, Endo<Row[]>> = align =>
  FN.flow(alignRow(align), AR.map);

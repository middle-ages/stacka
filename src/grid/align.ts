import { array as AR, function as FN } from 'fp-ts';
import { Align, matchVAlign, VAlign } from 'src/align';
import { Size, Pos } from 'src/geometry';
import { Binary, BinaryC, Endo, Unary } from 'util/function';
import { halfInt } from 'util/number';
import { Pair } from 'util/tuple';
import { measureAligned } from './ops';
import { row } from './row/row';
import { Grid } from './types';

/**
 * Expand given column up & down by given pair of numbers. Column is expanded
 * with empty rows at given width.
 */
const expandColumn: BinaryC<number, Pair<number>, Endo<Grid>> =
  width =>
  ([top, bottom]) =>
  grid => {
    const emptyRow = row.emptyN(width);
    return AR.replicate(top, emptyRow).concat(
      grid,
      AR.replicate(bottom, emptyRow),
    );
  };

/** Shrink given column from both sides by given number pair */
const shrinkColumn: Unary<Pair<number>, Endo<Grid>> = ([left, right]) =>
  FN.flow(AR.dropLeft(Math.abs(left)), AR.dropRight(Math.abs(right)));

/**
 * Resize a list of rows to given height using the given vertical alignment.
 * Width will be used as width of new empty rows, if required.
 */
export const alignColumn: BinaryC<VAlign, Size, Endo<Grid>> =
  align =>
  ({ width, height }) =>
  column => {
    const hΔ = height - column.length;

    if (!hΔ) return column;

    const around: Pair<number> = FN.pipe(
      align,
      matchVAlign([0, hΔ], halfInt(hΔ), [hΔ, 0]),
    );

    return FN.pipe(
      column,
      FN.pipe(around, hΔ > 0 ? expandColumn(width) : shrinkColumn),
    );
  };

/**
 * Align a child grid to a parent grid of different size
 *
 * @param align child alignment, used when smaller than parent
 * @param size parent size and size of returned child
 * @returns
 * @param grid child grid to align
 * @returns
 * Child grid resized to given size, according to given alignment
 */
export const align: BinaryC<Align, Size, Endo<Grid>> =
  ({ horizontal, vertical }) =>
  size =>
    FN.flow(
      FN.pipe(size, alignColumn(vertical)),
      FN.pipe(size.width, row.alignRows(horizontal)),
    );

/** Expand grid at given position to given bounds */
export const expandGrid: Binary<Pos, Size, Endo<Grid>> =
  ({ top, left }, { width, height }) =>
  grid => {
    const { width: gridWidth, height: gridHeight } = measureAligned(grid),
      [bottom, right] = [height - gridHeight - top, width - gridWidth - left],
      expandVertical = FN.pipe([top, bottom], expandColumn(width)),
      expandHorizontal = row.expandRow([left, right]);

    return FN.pipe(grid, AR.map(expandHorizontal), expandVertical);
  };

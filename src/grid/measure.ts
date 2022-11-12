import { predicate as PRE } from 'fp-ts';
import * as CE from 'src/cell';
import { Size, size as SZ } from 'src/geometry';
import { Binary, BinaryC, Unary } from 'util/function';
import { Pair, Tuple3 } from 'util/tuple';
import * as TY from './types';
import { Grid } from './types'; // measure count of empty rows from grid top

const isNonEmpty: Unary<Grid, PRE.Predicate<number>> = grid => {
  const readType = CE.readPackedType(grid.buffer);
  return (idx: number) => readType(idx * CE.cellWords) !== 0;
};

/**
 * Measure top+bottom empty row count. Returns a 3-tuple of row counts:
 *
 * 1. top gap
 * 1. content
 * 1. bottom gap
 *
 */
export const vGaps: Binary<Grid, Size, Tuple3<number>> = (grid, size) => {
  if (TY.isEmpty(grid)) return [0, 0, 0];

  const [area, test] = [SZ.area(size), isNonEmpty(grid)],
    { width, height } = size;

  let idx;

  for (idx = 0; idx < area; idx++) if (test(idx)) break;
  const top = Math.floor(idx / width);
  if (top === height) return [height, 0, 0];
  else if (top + 1 === height) return [top, 1, 0];

  for (idx = area - 1; idx > top; idx--) if (test(idx)) break;
  const bottom = Math.floor((area - 1 - idx) / width);
  return [top, height - top - bottom, bottom];
};

/** Given an offset, finds distance to next non-empty offset */
export const leftGap: BinaryC<Grid, number, number> = grid => initOffset => {
  if (TY.isEmpty(grid)) return 0;
  const test = isNonEmpty(grid),
    limit = initOffset + grid.width;

  let idx;
  for (idx = initOffset; idx < limit; idx++) if (test(idx)) break;

  return idx - initOffset;
};

/**
 * Given an offset, finds distance to next non-empty offset, and the distance
 * from row end to previous non-empty offset
 *
 */
export const hGaps: BinaryC<Grid, number, Pair<number>> = grid => {
  if (TY.isEmpty(grid)) return () => [0, 0];

  const test = isNonEmpty(grid),
    width = grid.width;

  return (initOffset: number) => {
    const colOffset = initOffset / CE.cellWords,
      nextColOffset = colOffset + width;

    let idx;
    for (idx = colOffset; idx < nextColOffset; idx++) if (test(idx)) break;

    const leftGap = idx - colOffset;
    if (leftGap === width) return [width, 0];

    const [leftLimit, initRight] = [idx, nextColOffset - 1];
    for (idx = initRight; idx >= leftLimit; idx--) if (test(idx)) break;

    return [leftGap, initRight - idx];
  };
};

import { Size } from 'src/geometry';
import { function as FN } from 'fp-ts';
import { Endo, Unary } from 'util/function';
import { floorMod } from 'util/number';
import * as CE from 'src/cell';
import * as TY from './types';
import { Grid } from './types';

const hStretch: Unary<number, Endo<Grid>> = hGrow => grid => {
  if (hGrow === 0) return grid;

  const { width: readWidth, buffer: read } = grid,
    height = TY.countRows(grid),
    width = readWidth + hGrow,
    { buffer: write } = TY.sized({ width, height });

  const [ratio, rem] = floorMod([width, readWidth]);

  let [readIdx, writeIdx] = [0, 0];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < readWidth; x++) {
      const repeat = ratio + (x < rem ? 1 : 0);
      [readIdx, writeIdx] = CE.copyCells(repeat)(
        read,
        write,
        readIdx,
        writeIdx,
      );
    }
  }

  return { width, buffer: write };
};

const vStretch: Unary<number, Endo<Grid>> = vGrow => grid => {
  if (vGrow === 0) return grid;

  const { width, buffer: read } = grid,
    readHeight = TY.countRows(grid),
    height = readHeight + vGrow,
    { buffer: write } = TY.sized({ width, height });

  const [ratio, rem] = floorMod([height, readHeight]);

  let [readIdx, writeIdx] = [0, 0];

  for (let y = 0; y < readHeight; y++) {
    const repeat = ratio + (y < rem ? 1 : 0);
    [readIdx, writeIdx] = CE.repeatRow(repeat, width)(
      read,
      write,
      readIdx,
      writeIdx,
    );
  }

  return { width, buffer: write };
};

/**
 * Stretch the given grid to the given size
 *
 * While _expanding_ a grid means _add empty cells at edges_, _stretching_ is
 * more like stretching a rubber band: every cell gets an equal part of the
 * expansion.
 *
 * For example horizontally stretching the row `1234` 200% so that it is now
 * eight cells wide, will get you `11223344`. Expanding the same, assuming
 * center alignment, would get you to `␠␠1234␠␠` (note two spaces on each side).
 *
 */
export const stretch: Unary<Size, Endo<Grid>> =
  ({ width, height }) =>
  grid =>
    FN.pipe(
      grid,
      hStretch(width - grid.width),
      vStretch(height - TY.countRows(grid)),
    );

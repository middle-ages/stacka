import { Spacing } from 'src/geometry';
import { Endo, Unary } from 'util/function';
import * as CE from 'src/cell';
import * as TY from './types';
import { Grid } from './types';

/**
 * Given 4 numbers, expands the grid at the top/right/bottom/left directions by
 * that number of cells. The new areas are filled with `none` cells.
 *
 * 1. All spacing values are integers ≥ 0
 *
 */
export const expand: Unary<Spacing, Endo<Grid>> =
  ({ top, right, bottom, left }) =>
  grid => {
    const { width: readWidth, buffer: read } = grid,
      [hGrow, vGrow] = [right + left, top + bottom];

    if (TY.isEmpty(grid)) return TY.sized({ width: hGrow, height: vGrow });
    else if (hGrow === 0 && vGrow === 0) return grid;

    const readHeight = TY.countRows(grid),
      [width, height] = [readWidth + hGrow, readHeight + vGrow],
      rowWords = width * CE.cellWords,
      { buffer: write } = TY.sized({ width, height }),
      [leftWords, rightWords] = [CE.cellWords * left, CE.cellWords * right];

    let [readIdx, writeIdx] = [0, rowWords * top];

    for (let y = 0; y < readHeight; y++) {
      writeIdx += leftWords;

      for (let x = 0; x < readWidth; x++)
        [readIdx, writeIdx] = CE.copyCell(read, write, readIdx, writeIdx);

      writeIdx += rightWords;
    }

    return { width, buffer: write };
  };

import { Spacing } from 'src/geometry';
import { Endo, Unary } from 'util/function';
import * as CE from 'src/cell';
import * as TY from './types';
import { Grid } from './types';

/**
 * Given 4 numbers, chops the grid at the top/right/bottom/left directions by
 * that number of cells.
 *
 * If the chop, left or right, is inside a wide character sequence, we replace
 * the edge with an empty cell.
 *
 * Preconditions:
 *
 * 1. The grid must be big enough to be chopped by the given values
 * 2. All spacing values are integers ≥ 0
 *
 */
export const crop: Unary<Spacing, Endo<Grid>> =
  ({ top, right, bottom, left }) =>
  grid => {
    const { width: readWidth, buffer: read } = grid,
      [hChop, vChop] = [right + left, top + bottom],
      [width, height] = [readWidth - hChop, TY.countRows(grid) - vChop],
      [skipLeft, skipRight] = [left * CE.cellWords, right * CE.cellWords],
      { buffer: write } = TY.sized({ width, height });

    let [readIdx, writeIdx] = [readWidth * CE.cellWords * top, 0];

    for (let y = 0; y < height; y++) {
      readIdx += skipLeft;

      CE.copyInit(read, write, readIdx, writeIdx);

      // if last word of row head is 3 then left edge is cont
      const headLast = read[readIdx + 3];
      write[writeIdx + 3] =
        (headLast & 0xff) === 3 ? headLast & 0xff00 : headLast;

      readIdx += CE.cellWords;
      writeIdx += CE.cellWords;

      for (let x = 1; x < width - 1; x++)
        [readIdx, writeIdx] = CE.copyCell(read, write, readIdx, writeIdx);

      CE.copyStyle(read, write, readIdx, writeIdx);

      // if last word of row head is 2 then right edge is wide
      const tailLast = read[readIdx + 3];

      if ((tailLast & 0xff) === 2) {
        write[writeIdx + 2] = 0;
        write[writeIdx + 3] = 0;
      } else {
        CE.copyRune(read, write, readIdx, writeIdx);
        write[writeIdx + 3] = tailLast;
      }

      readIdx += CE.cellWords + skipRight;
      writeIdx += CE.cellWords;
    }

    return { width, buffer: write };
  };

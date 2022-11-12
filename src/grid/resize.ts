import { Align, matchHAlign as hAlign, matchVAlign as vAlign } from 'src/align';
import { Size } from 'src/geometry';
import { BinaryC, Endo } from 'util/function';
import { halfInt } from 'util/number';
import { expand } from './expand';
import { crop } from './crop';
import * as TY from './types';
import { Grid } from './types';

/**
 * Resize the grid to given size expanding/shrinking as required according to
 * given alignment
 */
export const resize: BinaryC<Align, Size, Endo<Grid>> =
  ({ horizontal, vertical }) =>
  ({ width, height }) =>
  grid => {
    const readWidth = grid.width,
      readHeight = TY.countRows(grid),
      [wΔ, hΔ] = [width - readWidth, height - readHeight];

    if (wΔ === 0 && hΔ === 0) return grid;

    const [[left, right], [top, bottom]] = [
      hAlign([0, wΔ], halfInt(wΔ), [wΔ, 0])(horizontal),
      vAlign([0, hΔ], halfInt(hΔ), [hΔ, 0])(vertical),
    ];

    if (wΔ >= 0)
      return hΔ >= 0
        ? expand({ top, right, bottom, left })(grid)
        : expand({ top: 0, right, bottom: 0, left })(
            crop({
              top: Math.abs(top),
              right: 0,
              bottom: Math.abs(bottom),
              left: 0,
            })(grid),
          );

    return hΔ <= 0
      ? crop({
          top: Math.abs(top),
          right: Math.abs(right),
          bottom: Math.abs(bottom),
          left: Math.abs(left),
        })(grid)
      : expand({ top, right: 0, bottom, left: 0 })(
          crop({
            top: 0,
            right: Math.abs(right),
            bottom: 0,
            left: Math.abs(left),
          })(grid),
        );
  };

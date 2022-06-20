import { function as FN } from 'fp-ts';
import { Size, size as SZ } from 'src/geometry';
import { Grid, grid } from 'src/grid';
import { BinaryC } from 'util/function';
import { center } from './center';
import { repeat } from './repeat';
import { stretch } from './stretch';
import { Backdrop, matchProjection } from './types';

/**
 * Paint a backdrop to a grid for the given size
 *
 * Used by `block.paint` to paint the block backdrop.
 */
export const paint: BinaryC<Backdrop, Size, Grid> =
  ({ image, project }) =>
  surfaceSize => {
    const { width: seedWidth, height: seedHeight } = grid.measureAligned(image);

    if (seedWidth === 0 || seedHeight === 0)
      return FN.pipe(surfaceSize, SZ.fill(grid.cell.empty));

    return FN.pipe(
      image,
      FN.pipe(
        surfaceSize,
        FN.pipe(project, matchProjection(stretch, repeat, center)),
      ),
    );
  };

export const asStrings: BinaryC<Backdrop, Size, string[]> = bd =>
  FN.flow(paint(bd), grid.asStrings);

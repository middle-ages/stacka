import { function as FN } from 'fp-ts';
import { align } from 'src/align';
import { Size } from 'src/geometry';
import * as GR from 'src/grid';
import { Grid } from 'src/grid';
import { BinaryC } from 'util/function';
import { Backdrop, matchProjection } from './types';

/**
 * Paint a backdrop to a grid for the given size
 *
 * Used by `block.paint` to paint the block backdrop.
 */
export const paint: BinaryC<Backdrop, Size, Grid> =
  ({ image, project }) =>
  size =>
    GR.isEmpty(image)
      ? GR.empty()
      : FN.pipe(
          image,
          FN.pipe(
            size,
            FN.pipe(
              project,
              matchProjection(
                GR.resizeElastic,
                GR.repeat,
                GR.resize(align.middleCenter),
              ),
            ),
          ),
        );

export const asStrings: BinaryC<Backdrop, Size, string[]> = bd =>
  FN.flow(paint(bd), GR.paint);

export const asStringsWith =
  (filler: string): BinaryC<Backdrop, Size, string[]> =>
  bd =>
    FN.flow(paint(bd), GR.paintWith(filler));

import { function as FN } from 'fp-ts';
import { align } from 'src/align';
import { Size } from 'src/geometry';
import { grid, Grid } from 'src/grid';
import { Endo, Unary } from 'util/function';

export const center: Unary<Size, Endo<Grid>> = surfaceSize => image =>
  FN.pipe(image, FN.pipe(surfaceSize, grid.align(align.middleCenter)));

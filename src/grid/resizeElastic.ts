import { function as FN } from 'fp-ts';
import { Size, size as SZ } from 'src/geometry';
import { Endo, Unary } from 'util/function';
import { shrink } from './shrink';
import { stretch } from './stretch';
import * as TY from './types';
import { Grid } from './types';

const hStretchVShrink: Unary<Size, Endo<Grid>> = size => grid =>
    FN.pipe(
      grid,
      stretch({
        width: size.width,
        height: TY.countRows(grid),
      }),
      shrink({
        width: size.width,
        height: size.height,
      }),
    ),
  vStretchHShrink: Unary<Size, Endo<Grid>> = size => grid =>
    FN.pipe(
      grid,
      stretch({
        width: grid.width,
        height: size.height,
      }),
      shrink({
        width: size.width,
        height: size.height,
      }),
    );

/** Stretch and shrink the grid so that it fits the given size */
export const resizeElastic: Unary<Size, Endo<Grid>> = size => grid => {
  const { width: wΔ, height: hΔ } = SZ.sub(size, TY.size(grid));
  return (
    wΔ >= 0
      ? hΔ >= 0
        ? stretch
        : hStretchVShrink
      : hΔ >= 0
      ? vStretchHShrink
      : shrink
  )(SZ.abs(size))(grid);
};

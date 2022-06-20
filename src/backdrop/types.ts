import { array as AR, function as FN } from 'fp-ts';
import { Grid } from 'src/grid';
import { Tuple3 } from 'util/tuple';
import { BinaryC, Unary } from 'util/function';

/**
 * The `Backdrop` is responsible for rendering the background layer of a box,
 * drawn behind all box content.
 *
 * It is modeled after the desktop wallpaper configurator, where you first
 * select an image of one size, and then how it will be shown on a screeen of
 * unknown dimensions.
 *
 * How to customize box background:
 *
 * 1. Set a grid of styled glyphs as the image
 *     1. Or select a solid color
 * 1. Choose how to project it as the background of a box of any size
 *     1. Available strategies:
 *         1. Stretch/shrink the image to fit the box dimensions
 *         1. Center image vs. the box, leaving the rest empty
 *         1. If the surface is larger than the image, repeat it
 *             1. Will clip image if too large for box background
 *
 * These allow for checkerboards, gradients, and a variety of other background
 * configurations.
 *
 **/
export interface Backdrop {
  image: Grid;
  project: Projection;
}

export const projections = ['stretch', 'repeat', 'center'] as const;

export type Projection = typeof projections[number];

export type Stretch = 'stretch';
export type Repeat = 'repeat';
export type Center = 'center';

export const buildBackdrop: BinaryC<Projection, Grid, Backdrop> =
  project => image => ({ project, image });

export const [stretch, repeat, center] = FN.pipe(
  [...projections],
  AR.map(buildBackdrop),
) as Tuple3<Unary<Grid, Backdrop>>;

export const matchProjection =
  <R>(stretch: R, repeat: R, center: R): Unary<Projection, R> =>
  proj =>
    proj === 'stretch' ? stretch : proj === 'repeat' ? repeat : center;

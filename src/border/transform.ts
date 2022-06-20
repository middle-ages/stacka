import { array as AR, function as FN, option as OP } from 'fp-ts';
import { BinaryC, BinOp, Unary } from 'util/function';
import { picks } from 'util/object';
import { Dir } from '../dir';
import { BorderDir, borderDirs, dirToBorderDirs } from './dir';
import { Border, emptyPartMap, monoBorder, PartMap } from './types';

/**
 * Convert a border on all border directions into a border that is only on the
 * given directions.
 *
 * E.g.: Given a line border on all directions, we can create a line border only
 * for the top left and bottom right corners:
 *
 * ```ts
 * pickDirs(lineBorder)([
 *   Borders.topLeft,
 *   Borders.bottomRight,
 * ])
 * ```
 */
export const pickDirs: BinaryC<Border, Readonly<BorderDir[]>, Border> =
  ({ parts }) =>
  dirs =>
    monoBorder({ ...emptyPartMap, ...FN.pipe(parts, picks(...dirs)) });

/** Convert a border on all directions to a border in one direction */
export const pickDir: BinaryC<Border, Dir, Border> = border => dir =>
  FN.pipe(dir, dirToBorderDirs, pickDirs(border));

const filterPartMap: Unary<PartMap, Partial<PartMap>> = partMap => {
  const dirs = FN.pipe(
    [...borderDirs],
    AR.filter(x => OP.isSome(partMap[x])),
  );
  return FN.pipe(partMap, picks(...dirs));
};

/**
 * Merge the parts of two borders. At every border direction, the second
 * overrides the first, unless the second has no part for this direction.
 *
 * Used to stack different borders at different directions.
 *
 * Second border style overrides first.
 **/
export const stackBorderParts: BinOp<Border> = (
  { parts: left },
  { parts: right, style },
) => {
  return { parts: { ...left, ...filterPartMap(right) }, style };
};

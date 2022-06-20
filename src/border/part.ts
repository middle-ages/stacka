import {
  array as AR,
  function as FN,
  option as OP,
  predicate as PRE,
  reader as RE,
  tuple as TU,
} from 'fp-ts';
import { flip, fork, uncurry2 } from 'fp-ts-std/Function';
import { sum } from 'fp-ts-std/ReadonlyArray';
import { head, last } from 'util/array';
import { colorize, TextColor } from 'util/color';
import { Binary, BinaryC, Endo, Unary } from 'util/function';
import { around, Char, orSpace } from 'util/string';
import {
  Pair,
  pairApply,
  pairMap,
  pairZip,
  Tuple3,
  tuple3Map,
} from 'util/tuple';
import { Dir, horizontal, snugDirs, vertical } from '../dir';
import { Size, size } from '../geometry/size';

import { dirToBorderDirs } from './dir';
import { Border, border, Part } from './types';

/** Returns the trio of border parts at given direction */
export const getDirParts: BinaryC<Border, Dir, Tuple3<Part>> = b =>
  FN.flow(dirToBorderDirs, FN.pipe(b, flip(border.get), tuple3Map));

/**  True if there is at least one char in the given direction */
export const hasBorderAt: Unary<Border, PRE.Predicate<Dir>> = b => dir =>
  FN.pipe(
    dir,
    getDirParts(b),
    AR.filter(FN.flow(TU.fst, OP.isSome)),
    PRE.not(AR.isEmpty),
  );

const getRenderedCorners: BinaryC<Border, Dir, Pair<string>> = b =>
  FN.flow(
    fork([
      FN.flow(getDirParts(b), fork([head, last])),
      FN.flow(snugDirs, pairMap(hasBorderAt(b))),
    ]),
    pairZip,
    pairMap(([flag, [c, s]]): [Char, TextColor] => [flag ? orSpace(c) : '', s]),
    pairMap(FN.flow(TU.mapSnd(colorize), pairApply)),
  );

/**
 * Given a direction, surrounds string with its corner parts.
 *
 * If there is no border at all for the corner direction, the corner will be an
 * empty string, even if the corner has a border part.
 *
 * If there is no border part for the corner, but the corner direction has a
 * border, the corner will be a space character.
 */
//:
export const addCorners: Binary<Border, Dir, Endo<string>> = FN.untupled(
  FN.flow(uncurry2(getRenderedCorners), FN.tupled(around)),
);

// What is the width of the border in the given direction?
export const measureBorderAt: BinaryC<Dir, Border, number> = dir => border =>
  hasBorderAt(border)(dir) ? 1 : 0;

// some the border sizes at given dirs
const measureSum: BinaryC<Dir[], Border, number> = FN.flow(
  FN.pipe(measureBorderAt, AR.traverse(RE.Applicative)),
  f => FN.flow(f, sum),
);

export const borderWidth: Unary<Border, number> = FN.pipe(
    [...horizontal],
    measureSum,
  ),
  borderHeight: Unary<Border, number> = FN.pipe([...vertical], measureSum);

export const borderSize: Unary<Border, Size> = FN.flow(
  fork([borderWidth, borderHeight]),
  size,
);

import { array as AR, function as FN } from 'fp-ts';
import { cartesian } from 'fp-ts-std/Array';
import { applyEvery, flip } from 'fp-ts-std/Function';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Pair } from 'util/tuple';
import { Endo, Unary } from 'util/function';
import { Matrix } from '../data';
import * as matrix from './matrix';

const off: Unary<Pair<number>[], Endo<Matrix>> = FN.flow(
  AR.map(matrix.setPxOff),
  applyEvery,
);

const centerRowsOff: Unary<number[], Endo<Matrix>> = FN.flow(
  flip<number[], number[], Pair<number>[]>(cartesian)([3, 4]),
  off,
);

export const [left, center, right] = FN.pipe(
    [[2], [3, 4], [5]],
    AR.map(centerRowsOff),
  ),
  [bottom, top] = FN.pipe(
    [right, left],
    mapBoth(f => FN.flow(matrix.turn, f, matrix.antiTurn)),
  );

const threeDirections: Endo<Matrix>[] = [
  FN.flow(top, right, bottom),
  FN.flow(right, bottom, left),
  FN.flow(bottom, left, top),
  FN.flow(left, top, right),
];

export const thinThickFix: Endo<Matrix>[] = FN.pipe(
  [
    [2, 2],
    [2, 5],
    [5, 2],
    [5, 5],
  ],
  AR.map(matrix.setPxOn),
);

export const centered: Endo<Matrix>[] = [
  FN.identity,
  ...thinThickFix,
  center,
  ...threeDirections,
  FN.flow(threeDirections[0], left),
];

/*

⁺⁺⁺##⁺⁺⁺  ⁺⁺⁺##⁺⁺⁺ 
⁺⁺⁺##⁺⁺⁺  ⁺⁺⁺##⁺⁺⁺
#####⁺⁺⁺  ⁺⁺⁺##⁺⁺⁺
########  ⁺⁺⁺#####
########  ⁺⁺⁺#####
#####⁺⁺⁺  ⁺⁺⁺⁺⁺⁺⁺⁺
⁺⁺⁺⁺⁺⁺⁺⁺  ⁺⁺⁺⁺⁺⁺⁺⁺
⁺⁺⁺⁺⁺⁺⁺⁺  ⁺⁺⁺⁺⁺⁺⁺⁺

*/

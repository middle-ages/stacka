import {
  array as AR,
  function as FN,
  nonEmptyArray as NE,
  predicate as PRE,
} from 'fp-ts';
import { stringEq } from 'util/string';
import { BinOp, Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { mapBoth } from 'fp-ts-std/Tuple';

export type Px = '#' | '⁺';
export type PxRow = TupleRes<Px>;
export type Matrix = TupleRes<PxRow>;
export type MatrixRow = `${Px}${Px}${Px}${Px}${Px}${Px}${Px}${Px}`;
export type TupleRes<T> = [T, T, T, T, T, T, T, T];

export type RowOp = BinOp<PxRow>;
export type RowCheck = PRE.Predicate<PxRow>;
export type Check = PRE.Predicate<Matrix>;
export type RelCheck = PRE.Predicate<Pair<Matrix>>;

export const resolution = 8,
  resolutionRange = NE.range(0, resolution - 1),
  halfRes = Math.floor(resolution / 2),
  thirdRes = Math.floor(resolution / 3),
  thirdResRange = NE.range(0, thirdRes - 1);

export const [pxOn, pxOff]: Pair<Px> = ['#', '⁺'];

export const [emptyRow, fullRow]: Pair<PxRow> = [
    ['⁺', '⁺', '⁺', '⁺', '⁺', '⁺', '⁺', '⁺'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
  ],
  [emptyMatrix, fullMatrix]: Pair<Matrix> = FN.pipe(
    [emptyRow, fullRow],
    mapBoth(<T>(t: T) => AR.replicate(resolution, t) as TupleRes<T>),
  );

export const isOn: PRE.Predicate<Px> = stringEq('#'),
  isOff: PRE.Predicate<Px> = PRE.not(isOn),
  invertPx: Endo<Px> = px => (isOn(px) ? pxOff : pxOn);

export const toBin: Unary<Matrix, string> = bm =>
  FN.pipe(bm, AR.chain(AR.map(p => (isOn(p) ? '1' : '0')))).join('');

import {
  array as AR,
  function as FN,
  predicate as PRE,
  tuple as TU,
} from 'fp-ts';
import { sum, transpose } from 'fp-ts-std/Array';
import { applyEvery, uncurry2 } from 'fp-ts-std/Function';
import { mapBoth } from 'fp-ts-std/Tuple';
import { splitAt } from 'util/array';
import { BinaryC, Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import {
  Check,
  emptyRow,
  fullRow,
  invertPx,
  isOn,
  Matrix,
  Px,
  pxOff,
  pxOn,
  PxRow,
  resolutionRange,
} from '../data';
import * as row from './row';

export const invert: Endo<Matrix> = mat =>
  FN.pipe(mat, AR.map(row.invert)) as Matrix;

export const isOnAt: Unary<Matrix, PRE.Predicate<Pair<number>>> =
  mat =>
  ([top, left]) =>
    FN.pipe(mat[top][left], isOn);

export const modRow: BinaryC<Endo<PxRow>, number, Endo<Matrix>> =
    f => i => mat => {
      const [before, px, after] = FN.pipe(mat, splitAt(i));
      return [...before, f(px), ...after] as Matrix;
    },
  mod: BinaryC<Endo<Px>, Pair<number>, Endo<Matrix>> = f =>
    FN.flow(TU.swap, uncurry2(FN.flow(row.mod(f), modRow)));

export const modRows: Unary<Endo<PxRow>, Endo<Matrix>> = f =>
  FN.pipe(resolutionRange, AR.map(modRow(f)), applyEvery);

export const set: BinaryC<boolean, Pair<number>, Endo<Matrix>> =
  b =>
  ([top, left]) =>
    FN.pipe(left, FN.pipe(top, row.mod(FN.constant(b ? pxOn : pxOff)), modRow));

export const [setPxOn, setPxOff]: Pair<Unary<Pair<number>, Endo<Matrix>>> = [
    set(true),
    set(false),
  ],
  invertPxAt: Unary<Pair<number>, Endo<Matrix>> = mod(invertPx);

export const modColumn: BinaryC<Endo<Px>, number, Endo<Matrix>> = f =>
  FN.flow(row.mod(f), modRows);

export const setColumn: BinaryC<Px, number, Endo<Matrix>> = FN.flow(
    FN.constant,
    modColumn,
  ),
  [setColumnOn, setColumnOff] = FN.pipe([pxOn, pxOff], mapBoth(setColumn)),
  invertColumn: Unary<number, Endo<Matrix>> = modColumn(invertPx);

export const [setColumnsOn, setColumnsOff]: Pair<
    Unary<number[], Endo<Matrix>>
  > = FN.pipe(
    [setColumnOn, setColumnOff],
    mapBoth(f => FN.flow(AR.map(f), applyEvery)),
  ),
  invertColumns = FN.flow(AR.map(invertColumn), applyEvery);

export const [hFlip, vFlip]: Pair<Endo<Matrix>> = [
  m => FN.pipe(m, AR.map(row.flip)) as Matrix,
  m => AR.reverse(m) as Matrix,
];

/** Turn matrix 90ᵒ clockwise */
export const turn: Endo<Matrix> = m => FN.pipe(transpose(m) as Matrix, vFlip);

/** Turn matrix 90ᵒ anti-clockwise */
export const antiTurn: Endo<Matrix> = m =>
  FN.pipe(transpose(m) as Matrix, hFlip);

export const [isRowOn, isRowOff]: Pair<Unary<number, Check>> = [
  n => rows => rows[n].join('') === fullRow.join(''),
  n => rows => rows[n].join('') === emptyRow.join(''),
];

export const pxCount: Unary<Matrix, number> = FN.flow(AR.map(row.countPx), sum);

import {
  array as AR,
  eq as EQ,
  function as FN,
  monoid as MO,
  show as SH,
  string as STR,
} from 'fp-ts';
import { curry2 } from 'fp-ts-std/Function';
import { unlines } from 'fp-ts-std/String';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Pair } from 'util/tuple';
import {
  Check,
  emptyMatrix,
  emptyRow,
  fullMatrix,
  fullRow,
  Matrix,
  Px,
  PxRow,
  RowCheck,
} from '../data/types';
import * as row from './row';

const pxMonoid: MO.Monoid<Px> = {
  empty: '⁺',
  concat: (fst, snd) => (fst === snd ? fst : '#'),
};

export const pxRowMonoid: MO.Monoid<PxRow> = {
  empty: emptyRow,
  concat: (fst, snd) => AR.zipWith(fst, snd, pxMonoid.concat) as PxRow,
};

export const monoid: MO.Monoid<Matrix> = {
  empty: emptyMatrix,
  concat: (fst, snd) => AR.zipWith(fst, snd, pxRowMonoid.concat) as Matrix,
};

export const pxEq: EQ.Eq<Px> = STR.Eq,
  pxRowEq: EQ.Eq<PxRow> = AR.getEq(pxEq),
  matrixEq: EQ.Eq<Matrix> = AR.getEq(pxRowEq);

export const [isEmptyRow, isFullRow]: Pair<RowCheck> = [
  curry2(pxRowEq.equals)(emptyRow),
  curry2(pxRowEq.equals)(fullRow),
];

export const showPxRow: SH.Show<PxRow> = { show: row.joinPx };

export const showMatrix: SH.Show<Matrix> = {
  show: FN.flow(AR.map(row.joinPx), unlines),
};

export const [isEmpty, isFull]: Pair<Check> = FN.pipe(
  [fullMatrix, fullMatrix],
  FN.pipe(matrixEq.equals, curry2, mapBoth),
);

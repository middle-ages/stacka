import { array as AR, function as FN, predicate as PRE } from 'fp-ts';
import { join, sum } from 'fp-ts-std/Array';
import { splitAt } from 'util/array';
import { BinaryC, Endo, Unary } from 'util/function';
import { stringEq } from 'util/string';
import { invertPx, isOn, MatrixRow, Px, PxRow, TupleRes } from '../data/types';

export const [splitPx, joinPx]: [
  Unary<MatrixRow, PxRow>,
  Unary<PxRow, MatrixRow>,
] = [row => Array.from(row) as TupleRes<Px>, row => row.join('') as MatrixRow];

export const invert: Endo<PxRow> = row =>
  FN.pipe(row, AR.map(invertPx)) as PxRow;

export const isOnAt: Unary<PxRow, PRE.Predicate<number>> = row => left =>
  isOn(row[left]);

export const mod: BinaryC<Endo<Px>, number, Endo<PxRow>> = f => i => row => {
  const [before, px, after] = FN.pipe(row, splitAt(i));
  return [...before, f(px), ...after] as PxRow;
};

export const countPx: Unary<PxRow, number> = row =>
  FN.pipe(
    row,
    AR.map(px => (isOn(px) ? 1 : 0)),
    sum,
  );

export const countAt: BinaryC<number[], PxRow, number> = idxs => row =>
  FN.pipe(
    idxs,
    FN.pipe(row, isOnAt, AR.map),
    AR.map(t => (t ? 1 : 0)),
    sum,
  );

export const flip: Endo<PxRow> = px => FN.pipe(px, AR.reverse) as PxRow;

export const isSymmetric: PRE.Predicate<PxRow> = row =>
  FN.pipe(row, AR.reverse, join(''), FN.pipe(row, join(''), stringEq));

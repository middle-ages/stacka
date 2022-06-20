import { monoid as MO, number as NU, ord as OR } from 'fp-ts';
import { sum } from 'fp-ts-std/Array';
import { flow, pipe } from 'fp-ts/lib/function';
import { Predicate } from 'fp-ts/lib/Predicate';
import { monoOrdStruct } from './fp-ts';
import { BinaryC, Endo, Unary } from './function';
import { monoObject } from './object';
import { Pair, Tuple4 } from './tuple';

/** Sum the values of a numeric `Record` */
export const sumValues: Unary<Record<PropertyKey, number>, number> = flow(
  Object.values,
  sum,
);

export const max: Unary<number[], number> = pipe(
    NU.Bounded,
    MO.max,
    MO.concatAll,
  ),
  min: Unary<number[], number> = pipe(NU.Bounded, MO.min, MO.concatAll);

export const clamp =
  (min: number, max: number): Endo<number> =>
  n =>
    n < min ? min : n > max ? max : n;

export const numEq: BinaryC<number, number, boolean> = a => b => a === b,
  positive: Predicate<number> = n => n > 0,
  negative: Predicate<number> = n => n < 0;

export const monoidMax: MO.Monoid<number> = MO.max(NU.Bounded),
  monoidMin: MO.Monoid<number> = MO.min(NU.Bounded);

export type numRecordMonoid = <K extends string>(
  keys: readonly K[],
) => MO.Monoid<Record<K, number>>;

/**
 * Given a num monoid and a tuple of keys, returns the monoid for the
 * a numeric struct with the given keys
 */
export const numRecordMonoid =
  (mo: MO.Monoid<number>): numRecordMonoid =>
  keys =>
    MO.struct<Record<typeof keys[number], number>>(pipe(keys, monoObject(mo)));

export const numRecordOrd = <K extends string>(
  keys: readonly K[],
): OR.Ord<Record<K, number>> => pipe(keys, monoOrdStruct(NU.Ord));

export const [
  recordSumMonoid,
  recordProductMonoid,
  recordMaxMonoid,
  recordMinMonoid,
]: Tuple4<numRecordMonoid> = [
  numRecordMonoid(NU.MonoidSum),
  numRecordMonoid(NU.MonoidProduct),
  numRecordMonoid(monoidMax),
  numRecordMonoid(monoidMin),
];

export const format: Unary<number, string> = n => n.toLocaleString();

export const halfInt: Unary<number, Pair<number>> = n => {
  const fst = Math.floor(n / 2);
  return [fst, n - fst];
};

export const matchSign =
  <R>(negative: R, zero: R, positive: R): Unary<number, R> =>
  n =>
    !n ? zero : n < 0 ? negative : positive;

import {
  array as AR,
  eq as EQ,
  function as FN,
  hkt as HKT,
  monoid as MO,
  number as NU,
  ord as OD,
  readonlyArray as RA,
} from 'fp-ts';
import { withSnd } from 'fp-ts-std/Tuple';
import { Kind, URIS } from 'fp-ts/lib/HKT';
import { Unary } from 'util/function';
import {
  monoObject,
  ObjectEntry,
  pluck,
  setPropOf,
  typedEntries,
} from 'util/object';
import { ByteArray } from './array';

export type Extract<F extends HKT.URIS, B> = <A>(from: HKT.Kind<F, A>) => B;

export type Extract2<F extends HKT.URIS2, B> = <E, A>(
  from: HKT.Kind2<F, E, A>,
) => B;

export type Mapper<F extends URIS> = <A, B>(
  f: Unary<A, B>,
) => Unary<Kind<F, A>, Kind<F, B>>;

export const sortBy =
  <T>() =>
  <K extends string & keyof T>(name: K): Unary<OD.Ord<T[K]>, OD.Ord<T>> =>
    OD.contramap(pluck(name));

type OrdStruct<T> = { [K in keyof T]: OD.Ord<T[K]> };
type OrdEntry<T> = ObjectEntry<OrdStruct<T>>;

/** Convert a struct of `Ord`s into an ord of struct */
export const ordStruct = <T>(
  ord: MO.Monoid<OD.Ord<T>>,
): Unary<OrdStruct<T>, OD.Ord<T>> =>
  FN.flow(
    typedEntries,
    RA.map<OrdEntry<T>, OD.Ord<T>>(([a, b]) =>
      FN.pipe(
        b,
        OD.contramap(x => x[a]),
      ),
    ),
    MO.concatAll(ord),
  );

/** Convert a record `K ⇒ Ord<V>` into an `Ord<Record<K, V>>` */
export const monoOrdStruct =
  <V>(ord: OD.Ord<V>) =>
  <K extends string>(keys: readonly K[]): OD.Ord<Record<K, V>> =>
    ordStruct(OD.getMonoid<Record<K, V>>())(monoObject(ord)(keys));

export const recordEq =
  <T extends Record<keyof T, T[keyof T]>>(eq: EQ.Eq<T[keyof T]>) =>
  <K extends keyof T>(keys: K[]): EQ.Eq<T> =>
    FN.pipe(
      keys,
      AR.map(withSnd(eq)),
      Object.fromEntries,
      EQ.struct,
    ) as EQ.Eq<T>;

export const maxPositiveMonoid: MO.Monoid<number> = FN.pipe(
  NU.Bounded,
  MO.max,
  // fp-ts max zero is -∞, but for positives, 0 is correct
  FN.pipe(0, setPropOf<MO.Monoid<number>>()('empty')),
);

export const byteArrayEq: EQ.Eq<ByteArray> = {
  equals: (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = a.length; -1 < i; i -= 1) if (a[i] !== b[i]) return false;
    return true;
  },
};

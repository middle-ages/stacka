import { not } from 'fp-ts/lib/Predicate';
import { eq as EQ } from 'fp-ts';
import { A } from 'ts-toolbelt';

export const undef = (o: any): o is undefined => o === undefined;
export const defined = (o: any): o is {} => not(undef)(o);

export const upCast =
  <U>() =>
  <T extends U>(a: T): U =>
    a as U;

export const nullEq: EQ.Eq<null> = EQ.fromEquals(
  (a, b) => a === null && a === b,
);

/** Helper types: expand a computed type recursively/flat */
export type Explain<T> = A.Compute<T, 'deep'>;
export type ExplainFlat<T> = A.Compute<T, 'flat'>;

export const debug = <A>(a: A): A => {
  console.log({ a });
  return a;
};

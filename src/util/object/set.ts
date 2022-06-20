import { function as FN } from 'fp-ts';
import { Endo, PartialEndo, Unary } from 'util/function';
import { HasKeyEndo, HasTotalKey, SetterOf, SetValue } from './types';

export type MergeFrom = <A>(a: A) => <B>(b: B) => B & A;
export const mergeFrom: MergeFrom = a => b => Object.assign({}, b, a);

export const setProp: SetValue = k => v => o => ({ ...o, [k]: v });

export const setPropOf =
  <T extends {}>() =>
  <K extends keyof T>(k: K): SetterOf<T, K> =>
  v =>
  o => ({ ...o, [k]: v });

export const modProp =
  <K extends PropertyKey>(k: K) =>
  <V>(f: PartialEndo<V>): HasKeyEndo<K, V> =>
  o =>
    FN.pipe(o[k], f, setProp(k))(o);

export const modTotal =
  <K extends PropertyKey>(k: K) =>
  <V>(f: Endo<V>) =>
  <T extends HasTotalKey<K, V>>(o: T): T => ({ ...o, [k]: f(o[k]) });

export const modPropOf =
  <T extends {}>() =>
  <K extends keyof T>(k: K): Unary<Endo<T[K]>, Endo<T>> =>
  f =>
  o => ({ ...o, [k]: f(o[k]) });

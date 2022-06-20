import {
  array as AR,
  function as FN,
  readonlyArray as RA,
  tuple as TU,
} from 'fp-ts';
import { withSnd } from 'fp-ts-std/Tuple';
import { Endo, Unary } from 'util/function';
import { typedKeys } from './get';
import { FromEntries, HasKeyEndo, ObjectEntries, ObjectEntry } from './types';

export type HasListKeyMod<K extends PropertyKey, V> = Unary<
  Endo<V>,
  HasKeyEndo<K, V[]>
>;

export const typedEntries = <T extends {}>(o: T): ObjectEntries<T> =>
  Object.entries(o) as any;

export const typedFromEntries = <
  T extends readonly [...(readonly [PropertyKey, any][])],
>(
  entries: T,
) => Object.fromEntries(entries) as FromEntries<T>;

export const monoObject =
  <V>(v: V) =>
  <K extends string>(keys: readonly K[]): Record<K, V> =>
    FN.pipe(keys, RA.map<K, [K, V]>(withSnd(v)), Object.fromEntries);

export const objectMono =
  <K extends string>(keys: readonly K[]) =>
  <V>(v: V): Record<K, V> =>
    monoObject(v)(keys);

export const mapKeysOf =
  <T extends {}>() =>
  <R>(f: Unary<PropertyKey & keyof T, R>): Unary<T, readonly R[]> =>
    FN.flow(typedKeys, RA.map(f));

export const mapValuesOf =
  <K extends PropertyKey, V>() =>
  <R>(f: Unary<V, R>) =>
  (o: Record<K, V>): Record<K, R> =>
    FN.pipe(
      Object.entries(o) as [K, V][],
      AR.map(TU.mapSnd(f)),
      Object.fromEntries,
    );

export const mapValues =
  <A, B>(f: Unary<A, B>) =>
  <K extends PropertyKey>(o: Record<K, A>): Record<K, B> =>
    FN.pipe(
      Object.entries(o) as [K, A][],
      AR.map(TU.mapSnd(f)),
      Object.fromEntries,
    );

export const mapEntriesOf =
  <T extends {}>() =>
  <R>(f: Unary<ObjectEntry<T>, R>): Unary<T, readonly R[]> =>
    FN.flow(typedEntries, RA.map(f));

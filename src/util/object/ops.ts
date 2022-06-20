import {
  array as AR,
  function as FN,
  readonlyArray as RA,
  tuple as TU,
} from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { splitAt } from '../array';
import { Endo, Lazy, Unary } from '../function';
import { leftTupleWith } from '../tuple';
import { typedKeys } from './get';
import { modProp, modPropOf, setPropOf } from './set';
import {
  AccessorListOf,
  FromEntries,
  GetterListOf,
  GetterOf,
  HasKey,
  HasKeyEndo,
  ModifierListOf,
  ModifierOf,
  ObjectEntries,
  ObjectEntry,
  SetterListOf,
} from './types';

export type Merge = <A>(a: A) => <B>(b: B) => A & B;
export const merge: Merge = a => b => Object.assign({}, a, b);

export const mergeObjects = <T>(objects: readonly T[]): T =>
  Object.assign({}, ...objects);

export type HasListKeyMod<K extends PropertyKey, V> = Unary<
  Endo<V>,
  HasKeyEndo<K, V[]>
>;

export const modN =
  <V>(n: number) =>
  <K extends string>(k: K): HasListKeyMod<K, V> =>
  f =>
    modProp(k)<V[]>(xs => {
      const [b, x, a] = splitAt(n)(xs ?? []);
      return [...b, f(x), ...a];
    });

export const modFirst =
    <V>() =>
    <K extends string>(k: K) =>
      modN<V>(0)(k),
  modLast =
    <V>() =>
    <K extends string>(k: K) =>
      modN<V>(-1)(k);

export const chainN =
  <V>(n: number) =>
  <K extends string>(k: K) =>
  (f: Unary<V, V[]>): HasKeyEndo<K, V[]> =>
    modProp(k)<V[]>(xs => {
      const [b, x, a] = splitAt(n)(xs ?? []);
      return [...b, ...f(x), ...a];
    });

export const chainHead = <V>() => chainN<V>(0),
  chainLast = <V>() => chainN<V>(-1);

export const bindTo0 =
  <K extends string>(key: K) =>
  <A, T extends { [P in K]: Lazy<A> }>(o: T): Lazy<A> =>
    o[key].bind(o);

export const bindTo1 =
  <K extends string>(key: K) =>
  <A, B, T extends { [P in K]: Unary<A, B> }>(o: T): Unary<A, B> =>
    o[key].bind(o);

export const method0 =
  <K extends string>(k: K) =>
  <A, T extends { [k in K]: Lazy<A> }>(o: T) =>
    o[k]();

export const method1 =
  <K extends string>(k: K) =>
  <T extends { [k in K]: Unary<A, B> }, A, B = A>(o: T): Unary<A, B> =>
    o[k];

export const toString = <T extends { toString: Lazy<string> }>(o: T): string =>
  o.toString();

export const typedEntries = <T>(o: T): ObjectEntries<T> =>
  Object.entries(o) as any;

export const typedFromEntries = <
  T extends readonly [...(readonly [PropertyKey, any][])],
>(
  entries: T,
) => Object.fromEntries(entries) as FromEntries<T>;

export const omitKeys =
  <K extends PropertyKey>(omit: readonly K[]) =>
  <T extends HasKey<K, T[K]>>(o: T): Omit<T, K> => {
    const filtered = [
      ...FN.pipe(
        o,
        Object.entries,
        RA.filter(entry => !omit.includes(entry[0] as K)),
      ),
    ];
    return typedFromEntries(filtered) as Omit<T, K>;
  };

export const monoObject =
  <V>(v: V) =>
  <K extends string>(keys: readonly K[]): Record<K, V> =>
    FN.pipe(keys, RA.map<K, [K, V]>(leftTupleWith(v)), Object.fromEntries);

export const objectMono =
  <K extends string>(keys: readonly K[]) =>
  <V>(v: V): Record<K, V> =>
    monoObject(v)(keys);

export const mapKeysOf =
  <T extends {}>() =>
  <R>(f: Unary<PropertyKey & keyof T, R>): Unary<T, readonly R[]> =>
    FN.flow(typedKeys, RA.map(f));

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

export const makeGetterOf: <T>() => (k: keyof T) => GetterOf<T, typeof k> =
  () => k => o =>
    o[k];

export const makeGetters =
  <T extends {}>(): Unary<readonly (keyof T)[], GetterListOf<T>> =>
  ks =>
    FN.pipe(ks, RA.map(makeGetterOf<T>())) as GetterListOf<T>;

export const makeSetters =
  <T extends {}>() =>
  (ks: readonly (keyof T)[]) =>
    FN.pipe(ks, RA.map(setPropOf<T>())) as SetterListOf<T>;

export const makeModifiers =
  <T extends {}>() =>
  (ks: readonly (keyof T)[]) => {
    const makeModifier = (k: keyof T): ModifierOf<T, typeof k> =>
      modPropOf<T>()(k);
    return FN.pipe(ks, RA.map(makeModifier)) as ModifierListOf<T>;
  };

export const makeAccessors = <T extends {}>(): Unary<
  readonly (keyof T)[],
  AccessorListOf<T>
> => fork([makeGetters<T>(), makeSetters<T>(), makeModifiers<T>()]);

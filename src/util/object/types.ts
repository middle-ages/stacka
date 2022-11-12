import { U } from 'ts-toolbelt';
import { Effect, Endo, Unary } from 'util/function';

export type HasTotalKey<K extends PropertyKey, V> = { [k in K]: V };

export type HasKey<K extends PropertyKey, V> = HasTotalKey<K, V>;

export type HasKeyEndo<K extends PropertyKey, V> = Endo<HasKey<K, V>>;

export type SetValue = <K extends PropertyKey>(
  k: K,
) => <V>(v: V) => HasKeyEndo<K, V>;

export type IntersectUnion<T> = (T extends T ? Effect<T> : never) extends (
  p: infer U,
) => void
  ? U
  : never;

export type KeyList<T> = U.ListOf<keyof T>;

/**
 * ```ts
 * export interface Foo {
 *   a: number;
 *   b: string;
 * }
 * export type Res = ValueList<Foo>; // [number, string]
 * ```gG
 */
export type ValueList<
  T,
  KS extends KeyList<T> = KeyList<T>,
> = KS['length'] extends 0
  ? []
  : [T[KS[0]], ...ValueList<Omit<T, KS[0]>, KeyList<Omit<T, KS[0]>>>];

/**
 * ```ts
 * export interface Foo {
 *   a: number;
 *   b: string;
 * }
 * export type Res = ObjectEntry<Foo>; // ["a", number] | ["b", string]
 * ```
 */
export type ObjectEntry<T> = { [K in keyof T]: [K, T[K]] }[keyof T];

/**
 * ```ts
 * export interface Foo {
 *   a: number;
 *   b: string;
 * }
 * export type Res = ObjectEntries<Foo>; // [["a", number], ["b", string]]
 * ```
 */
export type ObjectEntries<T> = U.ListOf<ObjectEntry<T>>;

/**
 * ```ts
 *
 * export interface Foo {
 *   a: number;
 *   b: string;
 * }
 * export type Res = FromEntries<ObjectEntries<Foo>>; // Foo
 * ```
 */
export type FromEntries<
  T extends readonly [...(readonly [PropertyKey, any][])],
> = Flatten<IntersectUnion<EntryToRecord<T[number]>>>;

type Flatten<T> = {} & { [P in keyof T]: T[P] };

type EntryToRecord<T extends readonly [PropertyKey, any]> = T extends T
  ? Record<T[0], T[1]>
  : never;

export type SetterOf<T extends {}, K extends keyof T> = Unary<T[K], Endo<T>>;

export type FromKeys<K extends string> = <R>(f: Unary<K, R>) => Record<K, R>;

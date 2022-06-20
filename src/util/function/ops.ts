import { function as FN } from 'fp-ts';
import { uncurry2 } from 'fp-ts-std/Function';
import {
  Binary,
  BinaryC,
  Effect,
  Endo,
  EndoOf,
  Kestrel,
  Lazy,
  PartialEndo,
  Unary,
} from './types';

export const apply0 = <T>(fn: Lazy<T>): T => fn();
export const apply1 =
  <A>(a: A) =>
  <F extends Unary<A, any>>(fn: F): ReturnType<F> =>
    fn(a);

export const λk: Kestrel = o => () => o;

export const ensureValue =
  <V extends {}>(v: V): PartialEndo<V> =>
  x =>
    x ?? v;

export const tap =
  <T>(f: Effect<T>): EndoOf<T> =>
  o => {
    f(o);
    return o;
  };

export const invoke0 =
  <T extends { [K in keyof T]: Lazy<any> }>() =>
  <K extends keyof T>(k: K) =>
  (o: T): ReturnType<T[K]> =>
    o[k]();

export const addEndo =
  <A>(f: EndoOf<A>): Endo<EndoOf<A>> =>
  g =>
    FN.flow(f, g);

/**
 * ```
 * const n: number = pipe('foo', callWith(s => t => (s + t).length)); // 6
 * ```
 */
export const callWith =
  <A, B>(f: Unary<A, Unary<A, B>>): Unary<A, B> =>
  a =>
    FN.pipe(a, f)(a);

/**
 * Uncurry and then untuple a function. E.g.:
 *
 * ```ts
 * const fᶦ  = (a: number) => (b: number): number => a + b;
 *
 * const fᶦᶦ = uncurry2T(fᶦ);
 *
 * // fᶦᶦ(1, 2) === 3
 * ```
 */
export type uncurry2T = <A, B, C>(f: BinaryC<A, B, C>) => Binary<A, B, C>;
export const uncurry2T: uncurry2T = FN.flow(uncurry2, FN.untupled);

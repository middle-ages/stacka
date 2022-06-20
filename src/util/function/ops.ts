import { function as FN } from 'fp-ts';
import { uncurry2 } from 'fp-ts-std/Function';
import { Binary, BinaryC, Lazy, Unary } from './types';

export const apply0 = <T>(fn: Lazy<T>): T => fn();

export const apply1 =
  <A>(a: A) =>
  <F extends Unary<A, any>>(fn: F): ReturnType<F> =>
    fn(a);

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

/** A flipped curry for binary functions */
export type curry2F = <A, B, C>(f: Binary<A, B, C>) => BinaryC<B, A, C>;

export const curry2F: curry2F = f => b => a => f(a, b);

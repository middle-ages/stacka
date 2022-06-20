import { either as EI } from 'fp-ts';
import { pipe } from 'fp-ts/lib/function';
import { Lazy } from './function';

const _tag = Symbol();

export type Thunk<T> = Lazy<Tco<T>>;
export type Wrapped<T> = EI.Either<Thunk<T>, T>;

export interface Tco<T> {
  _tag: typeof _tag;
  wrapped: Wrapped<T>;
}

const wrap = <T>(wrapped: Wrapped<T>): Tco<T> => ({ _tag, wrapped });

export const final = <T>(value: T): Tco<T> => pipe(value, EI.right, wrap);

export const delay = <T>(thunk: Lazy<Tco<T>>): Tco<T> =>
  pipe(thunk, EI.left, wrap);

/**
 * Trampoline combinator
 *
 * Given a trampolined (I.e. returns `Tco<T>` instead of `T`) tail-recursive
 * function, returns it's stack-safe version.
 *
 * A Trampolined function should return either:
 *
 * * `final(value)` - on final recursive call
 * * `delay(thunk)` - further recursion required
 *
 * ```ts
 * const safeFactorial: Endo<number> = n => {
 *   const factorial: Binary<number, number, Tco<number>> = (n, acc) =>
 *     n > 1 ? delay(() => factorial(n - 1, n * acc)) : final(acc);
 * //          ↑↑
 * //          must not recurse, instead returns lazy recursion
 *
 *   return flow(factorial, tco)(n, 1);
 * };
 *
 * const unsafeFactorial: Endo<number> = n =>
 *   n > 1 ? n * unsafeFactorial(n - 1) : 1;
 * //            ↑↑
 * //            unsafe version recurses oblivious to its impending doom
 *
 * const range = [1, 2, 3, 4 , 1_000_000];
 *
 * // Looking good, no issues with stack size
 * range.forEach(n => console.log({ n, safe: safeFactorial(n) }));
 *
 * // Final member of the range crashes with 'Maximum call stack size exceeded'
 * range.forEach(n => console.log({ n, unsafe: unsafeFactorial(n) }));
 * ```
 */
export const tco = <T>(res0: Tco<T>): T => {
  let { wrapped } = res0;
  while (EI.isLeft(wrapped)) wrapped = wrapped.left().wrapped;
  return wrapped.right;
};

import { fork } from 'fp-ts-std/Function';
import { flow, tupled } from 'fp-ts/lib/function';
import { assert } from 'vitest';
import { Effect, Unary } from './function';
import { Pair } from './tuple';

/** Assert first & second items in a pair are identical */
export type assertDeepEqual = <A>(pair: Pair<A>) => void;
export const assertDeepEqual: assertDeepEqual = tupled(assert.deepEqual);

/** Assert a function under test vs. an alternate implementation */
export const isSame = <A, B>(
  iut: Unary<A, B>,
  oracle: Unary<A, B>,
): Effect<A> => flow(fork([iut, oracle]), assertDeepEqual);

/**
 * Assert a function under test vs. an alternate implementation for a give set
 * of values from their shared domain.
 */
export const isSameForAll =
  <A, B>(iut: Unary<A, B>, oracle: Unary<A, B>): Effect<A[]> =>
  input =>
    input.forEach(isSame(iut, oracle));

export const blowsStack: Effect<() => void> = f =>
  assert.throws(f, /stack size exceeded/);

import { flow, pipe } from 'fp-ts/lib/function';
import { isSameForAll } from 'util/chai';
import { Binary, Endo } from 'util/function';
import { delay, final, tco, Tco } from 'util/tco';
import { assert, suite, test } from 'vitest';
import { blowsStack } from 'util/chai';

export const safe: Endo<number> = n => {
  const factorial: Binary<number, number, Tco<number>> = (n, acc) =>
    n > 1 ? delay(() => factorial(n - 1, n * acc)) : final(acc);

  return flow(factorial, tco)(n, 1);
};

export const unsafe: Endo<number> = n => (n > 1 ? n * unsafe(n - 1) : 1);

suite('documented example', () => {
  const safeRange = [1, 2, 3, 7, 10, 20];

  test('same results as unsafe version', () =>
    pipe(safeRange, isSameForAll(safe, unsafe)));

  const unsafeValue = 10 ** 6;

  test('unsafe crashes', () => blowsStack(() => unsafe(unsafeValue)));

  test('safe does not crash', () =>
    assert.doesNotThrow(() => safe(unsafeValue)));
});

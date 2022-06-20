import { function as FN, number as NU } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { test, assert } from 'vitest';
import { numRecordMonoid } from 'util/number';

test('numMonoidStruct', () => {
  const struct = { a: 1, b: 2, c: 3 },
    monoid = FN.pipe(
      NU.MonoidSum,
      FN.pipe(['a', 'b', 'c'], flip(numRecordMonoid)),
    );

  assert.deepEqual(monoid.concat(struct, struct), { a: 2, b: 4, c: 6 });
});

import * as laws from 'fp-ts-laws';
import { grid } from 'src/grid';
import { assert, suite, test } from 'vitest';

suite('grid instances', () => {
  suite('monoid', () => {
    test('concat', () =>
      assert.deepEqual(grid.monoid.concat(grid.monoid.empty, [[]]), [[]]));
  });
  test('eq', () => laws.eq(grid.eq, grid.getArb(4)));
});

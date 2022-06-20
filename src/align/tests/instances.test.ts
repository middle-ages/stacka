import { assert, suite, test } from 'vitest';
import { minSortedAlign, showAlign } from '../instances';
import { align } from '../align';

suite('instances', () => {
  test('show', () => assert.equal(showAlign.show(align.topLeft), '⭶'));
  test('minSortedAlign', () =>
    assert.equal(
      minSortedAlign(align.topLeft, align.bottomRight),
      align.topLeft,
    ));
});

import { align } from 'src/align';
import { assert, suite, test } from 'vitest';

suite('instances', () => {
  test('show', () => assert.equal(align.show(align.topLeft), '⭶'));
  test('minSortedAlign', () =>
    assert.equal(
      align.minSorted(align.topLeft, align.bottomRight),
      align.topLeft,
    ));
});

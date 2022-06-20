import { function as FN } from 'fp-ts';
import { deltaMaxWidth, fillSize, maxRowWidth, size } from 'src/geometry';
import stringWidth from 'string-width';
import { Unary } from 'util/function';
import { assert, suite, test } from 'vitest';

suite('size', () => {
  const text = ['a', 'bb', 'ccc', 'd'],
    max = maxRowWidth(text);

  test('maxRowWidth', () => assert.equal(max, 3));

  test('empty list maxRowWidth', () => assert.equal(maxRowWidth([]), 0));

  test('deltaMaxWidth', () => assert.equal(deltaMaxWidth(max)('bb'), 1));

  suite('fillSize', () => {
    const iut = FN.pipe([3, 4], size, fillSize('X'));

    test('width', () =>
      assert.deepEqual(
        iut.map(stringWidth as Unary<string, number>),
        [3, 3, 3, 3],
      ));

    test('height', () => assert.equal(iut.length, 4));
  });
});

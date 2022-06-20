import { function as FN } from 'fp-ts';
import { dir } from 'src/geometry';
import { assert, suite, test } from 'vitest';
import { mapBoth } from 'fp-ts-std/Tuple';

suite('dir', () => {
  test('basic', () => assert.equal(dir.left, 'left'));

  test('show', () => assert.equal(dir.show.show(dir.bottom), '↓'));

  test('snug', () =>
    assert.deepEqual(FN.pipe('left', dir.snug, mapBoth(dir.show.show)), [
      '↑',
      '↓',
    ]));

  test('reverse', () =>
    assert.equal(FN.pipe(dir.top, dir.reversed, dir.show.show), '↓'));
});

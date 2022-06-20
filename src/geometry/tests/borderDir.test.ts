import { array as AR, function as FN } from 'fp-ts';
import { borderDir } from 'src/geometry';
import { assert, suite, test } from 'vitest';

const show = borderDir.show.show;

suite('borderDir', () => {
  test('basic', () => assert.equal(borderDir.left, 'left'));

  test('show dir', () => assert.equal(show(borderDir.right), '→'));

  test('show corner', () => assert.equal(show(borderDir.bottomLeft), '↙'));

  test('snugBorderDirs', () =>
    assert.deepEqual(
      FN.pipe([...borderDir.snugBorderDirs('top')], AR.map(show)),
      ['↖', '↑', '↗'],
    ));

  test('snugCorners', () =>
    assert.deepEqual(FN.pipe([...borderDir.snugCorners('top')], AR.map(show)), [
      '↖',
      '↗',
    ]));

  test('snug', () =>
    assert.deepEqual(FN.pipe([...borderDir.snug('top')], AR.map(show)), [
      '←',
      '↖',
      '↑',
      '↗',
      '→',
    ]));
});

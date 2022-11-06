import * as laws from 'fp-ts-laws';
import { pos, size } from 'src/geometry';
import { assert, suite, test } from 'vitest';

const show = pos.show.show;

suite('pos', () => {
  test('basic', () => assert.equal(show(pos(1, 2)), '▲1:◀2'));

  test('minPos', () => {
    const actual = pos.min([pos(1, 5), pos(3, 2), pos(3, 3)]);
    assert.deepEqual(actual, pos(1, 2));
  });

  suite('translateToPositive', () => {
    test('negative', () => {
      assert.deepEqual(
        pos.translateToPositive([pos(-1, 5), pos(3, -2), pos(0, 0)]),
        [pos(0, 7), pos(4, 0), pos(1, 2)],
      );
    });

    test('all positive', () =>
      assert.deepEqual(pos.translateToPositive([pos(1, 5), pos(3, 2)]), [
        pos(1, 5),
        pos(3, 2),
      ]));
  });

  suite('rectSize', () => {
    test('positive', () =>
      assert.deepEqual(pos.rectSize([pos(5, 4), pos(1, 2)]), size(3, 5)));
    test('negative', () =>
      assert.deepEqual(pos.rectSize([pos(1, 2), pos(5, 4)]), size(3, 5)));
  });

  test('addSize', () =>
    assert.deepEqual(pos.addSize(size(3, 5))(pos(1, 2)), pos(5, 4)));
  test('subSize', () =>
    assert.deepEqual(pos.subSize(size(1, 2))(pos(3, 5)), pos(-1, -4)));

  suite('laws', () => {
    test('ord', () => laws.ord(pos.ord.left, pos.arb));
    test('sum monoid', () => laws.monoid(pos.monoid.sum, pos.eq, pos.arb));
    test('max monoid', () => laws.monoid(pos.monoid.max, pos.eq, pos.arb));
  });
});

import { function as FN } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { Unary } from 'util/function';
import { assert, suite, test } from 'vitest';
import { cell, Row, SplitResult, row } from 'src/grid';

suite('grid row chopAtMost ops', () => {
  const iut: Row = cell.parseRow('a🙂b');

  const [c1, ...c2to4] = iut,
    [c2, c3, c4] = c2to4,
    c1to3 = [c1, c2, c3];

  suite('grid cell splitMax', () => {
    suite('left', () => {
      const split: Unary<number, SplitResult> = FN.pipe(
        iut,
        flip(row.chopAtMostLeft),
      );

      test('chop narrow', () =>
        assert.deepEqual(split(1), { delta: 0, left: [c1], right: c2to4 }));

      test('chop with delta', () =>
        assert.deepEqual(split(2), { delta: 1, left: [c1], right: c2to4 }));

      test('chop with wide', () =>
        assert.deepEqual(split(3), { delta: 0, left: c1to3, right: [c4] }));
    });

    suite('right', () => {
      const split: Unary<number, SplitResult> = FN.pipe(
        iut,
        flip(row.chopAtMostRight),
      );

      test('chop narrow', () =>
        assert.deepEqual(split(1), { delta: 0, left: c1to3, right: [c4] }));

      test('chop with delta', () =>
        assert.deepEqual(split(2), { delta: 1, left: c1to3, right: [c4] }));

      test('chop with wide', () =>
        assert.deepEqual(split(3), { delta: 0, left: [c1], right: c2to4 }));
    });
  });

  suite('grid cell dropMax', () => {
    test('drop narrow left', () =>
      assert.deepEqual(row.dropAtMostLeft(1)(iut), c2to4));

    test('drop wide right', () =>
      assert.deepEqual(row.dropAtMostRight(3)(iut), [c1]));
  });
});

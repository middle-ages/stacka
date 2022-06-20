import { function as FN } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { Unary } from 'util/function';
import { assert, suite, test } from 'vitest';
import { cell, Row, SplitResult, row } from 'src/grid';

suite('grid row chopAtLeast ops', () => {
  const iut: Row = cell.parseRow('a🙂b');
  const [c1, c2, c3, c4] = iut;

  suite('left', () => {
    const split: Unary<number, SplitResult> = FN.pipe(
      iut,
      flip(row.chopAtLeastLeft),
    );

    test('narrow', () =>
      assert.deepEqual(split(1), {
        delta: 0,
        left: [c1],
        right: [c2, c3, c4],
      }));

    test('returned > requested', () =>
      assert.deepEqual(split(2), {
        delta: 1,
        left: [c1, c2, c3],
        right: [c4],
      }));

    test('returned == requested', () =>
      assert.deepEqual(split(3), {
        delta: 0,
        left: [c1, c2, c3],
        right: [c4],
      }));

    test('take all', () =>
      assert.deepEqual(split(4), { delta: 0, left: iut, right: [] }));
  });

  suite('right', () => {
    const split: Unary<number, SplitResult> = FN.pipe(
      iut,
      flip(row.chopAtLeastRight),
    );

    test('narrow', () =>
      assert.deepEqual(split(1), {
        delta: 0,
        left: [c1, c2, c3],
        right: [c4],
      }));

    test('returned > requested', () =>
      assert.deepEqual(split(2), {
        delta: 1,
        left: [c1],
        right: [c2, c3, c4],
      }));
  });
});

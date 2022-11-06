import { function as FN } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { cell, Row, row, SplitResult } from 'src/grid';
import { assert, suite, test } from 'vitest';

type Chop = typeof row.chopAtMostLeft;

const iut: Row = cell.parseRow('a🙂b');

const check =
  (chop: Chop) =>
  (name: string, chopN: number, { delta, left, right }: SplitResult) => {
    suite(name, () => {
      const {
        delta: actualDelta,
        left: actualLeft,
        right: actualRight,
      } = FN.pipe(iut, chop(chopN));
      test('delta', () => assert.equal(actualDelta, delta));
      test('left', () => assert.deepEqual(actualLeft, left));
      test('right', () => assert.deepEqual(actualRight, right));
    });
  };

const [checkLeft, checkRight] = FN.pipe(
  [row.chopAtMostLeft, row.chopAtMostRight],
  mapBoth(check),
);

suite('grid row chopAtMost ops', () => {
  const [c1, ...c2to4] = iut,
    [c2, c3, c4] = c2to4,
    c1to3 = [c1, c2, c3];

  suite('grid row chopAtMost', () => {
    suite('left', () => {
      checkLeft('chop narrow', 1, { delta: 0, left: [c1], right: c2to4 });
      checkLeft('chop with delta', 2, { delta: 1, left: [c1], right: c2to4 });
      checkLeft('chop with wide', 3, { delta: 0, left: c1to3, right: [c4] });
    });

    suite('right', () => {
      checkRight('chop narrow', 1, { delta: 0, left: c1to3, right: [c4] });
      checkRight('chop with delta', 2, { delta: 1, left: c1to3, right: [c4] });
      checkRight('chop with wide', 3, { delta: 0, left: [c1], right: c2to4 });
    });
  });
});

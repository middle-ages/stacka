import { option as OP, function as FN } from 'fp-ts';
import { size } from 'src/geometry';
import { RowList } from 'src/types';
import { BinaryC, Unary } from 'util/function';
import { Pair, pairMap } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { alignRowsWith } from '../rows';
import { HAlign } from '../types';

suite('rows', () => {
  const rows = ['a', 'ab', 'abcd'];

  const run: BinaryC<number, HAlign, RowList> = width => align =>
    FN.pipe(
      rows,
      FN.pipe([width, 0], size, alignRowsWith(OP.some('.'), align)),
    );

  const [runExpand, runShrink]: Pair<Unary<HAlign, RowList>> = FN.pipe(
    [5, 3],
    pairMap(run),
  );

  suite('alignRows', () => {
    suite('expand', () => {
      test('left', () =>
        assert.deepEqual(runExpand('left'), ['a....', 'ab...', 'abcd.']));
      test('center', () =>
        assert.deepEqual(runExpand('center'), ['..a..', '.ab..', 'abcd.']));
      test('right', () =>
        assert.deepEqual(runExpand('right'), ['....a', '...ab', '.abcd']));
    });

    suite('shrink', () => {
      test('left', () =>
        assert.deepEqual(runShrink('left'), ['a..', 'ab.', 'abc']));
      test('center', () =>
        assert.deepEqual(runShrink('center'), ['.a.', 'ab.', 'bcd']));
      test('right', () =>
        assert.deepEqual(runShrink('right'), ['..a', '.ab', 'bcd']));
    });
  });
});

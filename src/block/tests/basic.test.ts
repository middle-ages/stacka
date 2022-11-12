import { function as FN } from 'fp-ts';
import { align } from 'src/align';
import { Block, block } from 'src/block';
import { size } from 'src/geometry';
import { Pair } from 'util/tuple';
import * as GR from 'src/grid';
import { assert, suite, test } from 'vitest';

suite('block basic', () => {
  const tiny = block.fromRow('X'),
    small = FN.pipe('foo', block.fromRow, block.align.set(align.topCenter)),
    big = FN.pipe(
      ['bar', 'quux'],
      block.fromRows,
      block.align.set(align.topCenter),
    );

  suite('block size', () => {
    const check = (name: string, iut: Block, expect: Pair<number>) =>
      test(name, () =>
        assert.deepEqual(block.size.get(iut), size.tupled(expect)),
      );

    check('tiny', tiny, [1, 1]);
    check('small', small, [3, 1]);
    check('big', big, [4, 2]);
  });

  suite('resetSize', () => {
    const newGrid = GR.parseRow('XY'),
      widerTiny = FN.pipe(tiny, block.grid.set(newGrid));

    test('set rows but no reset size', () =>
      assert.equal(block.width.get(widerTiny), 1));

    test('set rows with reset size', () =>
      assert.equal(FN.pipe(widerTiny, block.resetSize, block.width.get), 2));
  });

  test('rect lens', () => assert.equal(block.zOrder.get(tiny), 0));
});

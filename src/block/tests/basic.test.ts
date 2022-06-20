import { function as FN } from 'fp-ts';
import { Block, block } from 'src/block';
import { size } from 'src/geometry';
import { assert, suite, test } from 'vitest';
import { Pair } from 'util/tuple';

suite('block basic', () => {
  const tiny = block.fromRow('X'),
    small = block.centered(['foo']),
    big = block.aligned(['bar', 'quux']);

  suite('block size', () => {
    const check = (name: string, iut: Block, expect: Pair<number>) =>
      test(name, () => assert.deepEqual(block.size.get(iut), size(expect)));

    check('tiny', tiny, [1, 1]);
    check('small', small, [3, 1]);
    check('big', big, [4, 2]);
  });

  suite('resetSize', () => {
    const iut = FN.pipe(tiny, block.rows.set(['XX']));
    test('set rows but no reset size', () =>
      assert.equal(block.width.get(iut), 1));

    test('set rows with reset size', () =>
      assert.equal(FN.pipe(iut, block.resetSize, block.width.get), 2));
  });

  test('showRowBlock', () =>
    assert.equal(block.show(tiny), 'Block(size:(w:1,h:1), align:⭹, data: 1)'));
});

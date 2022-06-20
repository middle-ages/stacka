import { function as FN } from 'fp-ts';
import { box } from 'src/box';
import { grid } from 'src/grid';
import { pos, size } from 'src/geometry';
import { assert, suite, test } from 'vitest';
import { testPaint } from './helpers';

suite('box basic', () => {
  suite('tiny box', () => {
    const tiny = box.fromRow('X');

    test('size', () => assert.deepEqual(box.size.get(tiny), size.square(1)));

    test('pos', () => assert.deepEqual(box.pos.get(tiny), pos.origin));

    test('charGrid', () =>
      assert.deepEqual(FN.pipe(tiny, box.grid.get, grid.asStringsWith('.')), [
        'X',
      ]));

    test('paintBlock', () =>
      assert.deepEqual(FN.pipe(tiny, box.paintBlock, grid.asStringsWith('.')), [
        'X',
      ]));

    testPaint('paint', tiny, ['X']);

    testPaint('composite', box.branch([tiny]), ['X']);

    suite('two children', () => {
      const h = FN.pipe('H', box.fromRow, box.left.set(1)),
        v = FN.pipe('V', box.fromRow, box.top.set(1));

      testPaint('horizontal', box.branch([tiny, h]), ['XH']);
      testPaint('vertical', box.branch([tiny, v]), ['X', 'V']);
      testPaint('both', box.branch([tiny, h, v]), ['XH', 'V.']);
    });
  });

  testPaint('double width character', box.fromRow('🙂'), ['🙂']);
});

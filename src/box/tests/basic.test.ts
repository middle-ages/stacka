import { function as FN } from 'fp-ts';
import { Align, HAlign } from 'src/align';
import { Box, Cat } from '../types';
import { pos, size } from 'src/geometry';
import * as GR from 'src/grid';
import { BinaryC } from 'util/function';
import { assert, suite, test } from 'vitest';
import { testPaint } from './helpers';
import * as BU from '../build';
import * as PA from '../paint';
import { exportRect as RCT } from '../rect';
import * as BL from '../block';

suite('box basic', () => {
  suite('tiny box', () => {
    const tiny = BU.fromRow('X');

    test('size', () => assert.deepEqual(RCT.size.get(tiny), size.square(1)));

    test('pos', () => assert.deepEqual(RCT.pos.get(tiny), pos.origin));

    test('charGrid', () =>
      assert.deepEqual(FN.pipe(tiny, BL.grid.get, GR.paintWith('.')), ['X']));

    test('paintBlock', () =>
      assert.deepEqual(FN.pipe(tiny, BL.paintBlock, GR.paintWith('.')), ['X']));

    testPaint('paint', tiny, ['X']);

    testPaint('composite', PA.branch([tiny]), ['X']);

    suite('with children', () => {
      const o = BU.fromRow('╸'),
        h = FN.pipe('─', BU.fromRow, RCT.left.set(2)),
        v = FN.pipe('│', BU.fromRow, RCT.top.set(1));

      const makeBox: BinaryC<Align, Box[], Box> = align =>
        FN.flow(PA.branch, BL.align.set(align));

      type TestAlign = BinaryC<Cat, string[], void>;

      const testHorizontal: TestAlign = f => expect =>
        testPaint('horizontal', f([o, h]), expect);

      const testVertical: TestAlign = f => expect =>
        testPaint('vertical', f([o, v]), expect);

      const testBoth: TestAlign = f => expect =>
        testPaint('both', f([h, v]), expect);

      const testThree: TestAlign = f => expect =>
        testPaint('three', f([o, h, v]), expect);

      suite('↑', () => {
        const top = (horizontal: HAlign) =>
          makeBox({ horizontal, vertical: 'top' });

        suite('←', () => {
          const align = top('left');

          testHorizontal(align)(['╸.─']);
          testVertical(align)(['╸', '│']);
          testBoth(align)(['..─', '│..']);
          testThree(align)(['╸.─', '│..']);
        });

        suite('ˣ', () => {
          const align = top('center');

          testHorizontal(align)(['╸.─']);
          testVertical(align)(['╸', '│']);
          testBoth(align)(['..─', '│..']);
          testThree(align)(['╸.─', '│..']);
        });

        suite('→', () => {
          const align = top('right');

          testHorizontal(align)(['╸.─']);
          testVertical(align)(['╸', '│']);
          testBoth(align)(['..─', '│..']);
          testThree(align)(['╸.─', '│..']);
        });
      });

      suite('ˣ', () => {
        const middle = (horizontal: HAlign) =>
          makeBox({ horizontal, vertical: 'middle' });

        suite('←', () => {
          const align = middle('left');

          testHorizontal(align)(['╸.─']);
          testVertical(align)(['╸', '│']);
          testBoth(align)(['..─', '│..']);
          testThree(align)(['╸.─', '│..']);
        });

        suite('ˣ', () => {
          const align = middle('center');

          testHorizontal(align)(['╸.─']);
          testVertical(align)(['╸', '│']);
          testBoth(align)(['..─', '│..']);
          testThree(align)(['╸.─', '│..']);
        });

        suite('→', () => {
          const align = middle('right');

          testHorizontal(align)(['╸.─']);
          testVertical(align)(['╸', '│']);
          testBoth(align)(['..─', '│..']);
          testThree(align)(['╸.─', '│..']);
        });
      });

      suite('↓', () => {
        const bottom = (horizontal: HAlign) =>
          makeBox({ horizontal, vertical: 'bottom' });

        suite('←', () => {
          const align = bottom('left');

          testHorizontal(align)(['╸.─']);
          testVertical(align)(['╸', '│']);
          testBoth(align)(['..─', '│..']);
          testThree(align)(['╸.─', '│..']);
        });

        suite('ˣ', () => {
          const align = bottom('center');

          testHorizontal(align)(['╸.─']);
          testVertical(align)(['╸', '│']);
          testBoth(align)(['..─', '│..']);
          testThree(align)(['╸.─', '│..']);
        });

        suite('→', () => {
          const align = bottom('right');

          testHorizontal(align)(['╸.─']);
          testVertical(align)(['╸', '│']);
          testBoth(align)(['..─', '│..']);
          testThree(align)(['╸.─', '│..']);
        });
      });
    });
  });

  testPaint('double width character', BU.fromRow('🙂'), ['🙂']);
  testPaint('wide around narrow', BU.fromRow('🙂a😢'), ['🙂a😢']);
  testPaint('wide after narrow', BU.fromRow('a🙂'), ['a🙂']);
  testPaint('narrow around wide', BU.fromRow('a🙂c'), ['a🙂c']);
});

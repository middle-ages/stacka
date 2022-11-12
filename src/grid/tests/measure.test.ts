import { function as FN } from 'fp-ts';
import { align as AL, HAlign } from 'src/align';
import * as CE from 'src/cell';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { show } from '../instances';
import { hGaps, leftGap, vGaps } from '../measure';
import * as PA from '../parse';
import * as TY from '../types';
import { Grid } from '../types';

suite('grid measure', () => {
  const grid1x1_0_0 = FN.pipe('x', CE.plainChar, TY.oneCell),
    grid1x6_2_3 = PA.parseRows('center', [' ', ' ', 'x', ' ', ' ', ' ']),
    grid2x4_1_2 = PA.parseRows('center', ['  ', ' x', '  ', '  ']);

  suite('vertical', () => {
    const testVGaps = (
      iut: Grid,
      expectTop: number,
      expectBody: number,
      expectBottom: number,
    ) => {
      const size = TY.size(iut);

      suite(`${show.show(iut)} top=${expectTop} bottom=${expectBottom}`, () => {
        const [actualTop, actualBody, actualBottom] = vGaps(iut, size);

        test('top', () => assert.equal(actualTop, expectTop));
        test('body', () => assert.equal(actualBody, expectBody));
        test('bottom', () => assert.equal(actualBottom, expectBottom));
      });
    };

    testVGaps(TY.empty(), 0, 0, 0);

    testVGaps(grid1x1_0_0, 0, 1, 0);
    testVGaps(grid1x6_2_3, 2, 1, 3);
    testVGaps(grid2x4_1_2, 1, 1, 2);
  });

  suite('horizontal', () => {
    suite('leftGap', () => {
      test('empty', () => assert.equal(leftGap(TY.empty())(0), 0));

      test('left=0', () => assert.equal(leftGap(grid1x1_0_0)(0), 0));

      suite('grid1x6_2_3', () => {
        const gap = leftGap(grid1x6_2_3);

        test('y=0', () => assert.equal(gap(0), 1));
        test('y=1', () => assert.equal(gap(1), 1));
        test('y=2', () => assert.equal(gap(2), 0));
        test('y=3', () => assert.equal(gap(3), 1));
      });

      suite('grid2x4_1_2', () => {
        const gap = leftGap(grid2x4_1_2);

        test('left=2', () => assert.equal(gap(0), 2));
        test('left=1', () => assert.equal(gap(2), 1));
      });
    });

    suite('hGaps', () => {
      const makeGrid: Unary<HAlign, Grid> = align =>
          PA.parseRows(align, ['abcd', 'abc', 'ab', 'a', '']),
        rowWidth = 4,
        gaps = (align: HAlign, row: number) =>
          FN.pipe(
            row * rowWidth * CE.cellWords,
            FN.pipe(align, makeGrid, hGaps),
          );

      const makeTest = (align: HAlign) => (row: number, expect: Pair<number>) =>
        test(`row ${row}`, () => assert.deepEqual(gaps(align, row), expect));

      suite(`align=${AL.hAlignSym.left}`, () => {
        const apply = makeTest('left');

        apply(0, [0, 0]);
        apply(1, [0, 1]);
        apply(2, [0, 2]);
        apply(3, [0, 3]);
        apply(4, [4, 0]);
      });

      suite(`align=${AL.hAlignSym.center}`, () => {
        const apply = makeTest('center');

        apply(0, [0, 0]);
        apply(1, [0, 1]);
        apply(2, [1, 1]);
        apply(3, [1, 2]);
        apply(4, [4, 0]);
      });

      suite(`align=${AL.hAlignSym.right}`, () => {
        const apply = makeTest('right');

        apply(0, [0, 0]);
        apply(1, [1, 0]);
        apply(2, [2, 0]);
        apply(3, [3, 0]);
        apply(4, [4, 0]);
      });
    });
  });
});

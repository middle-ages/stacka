import { array as AR } from 'fp-ts';
import { align as AL, mapVAlign, VAlign } from 'src/align';
import * as CE from 'src/cell';
import { Effect, Unary } from 'util/function';
import { Tuple3 } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import * as PA from '../parse';
import { Grid } from '../types';
import { vAlignGrid } from '../vAlignGrid';
import { testPaint } from './helpers';

suite('grid vAlign', () => {
  const nDots = (n: number) => AR.replicate(n, '.');

  const vAlign =
    (
      grid: string[],
      newHeight: number,
    ): Unary<VAlign, [Grid, Tuple3<number>]> =>
    align =>
      vAlignGrid(align, newHeight)(PA.parseRows('center', grid));

  const testVAlign =
    (
      name: string,
      grid: string[],
      newHeight: number,
    ): Effect<Record<VAlign, [string[], ...Tuple3<number>]>> =>
    expect => {
      suite(name, () => {
        mapVAlign(align => {
          const [aligned, [readIdx, writeIdx, writeBodyH]] = vAlign(
              grid,
              newHeight,
            )(align),
            [expectGrid, expectReadIdx, expectWriteIdx, expectWriteBodyH] =
              expect[align];

          suite(AL.vAlignSym[align], () => {
            testPaint('paint', aligned, expectGrid);

            test('read/writeIdx/writeHeight', () =>
              assert.deepEqual(
                [readIdx / CE.cellWords, writeIdx / CE.cellWords, writeBodyH],
                [expectReadIdx, expectWriteIdx, expectWriteBodyH],
              ));
          });
        });
      });
    };

  testVAlign(
    '1x1_0.0 ⇒ 1x3',
    ['x'],
    3,
  )({
    top: [['x', '.', '.'], 0, 0, 1],
    middle: [['.', 'x', '.'], 0, 1, 1],
    bottom: [['.', '.', 'x'], 0, 2, 1],
  });

  testVAlign(
    '1x2_1.0 ⇒ 1x5',
    ['', 'x'],
    5,
  )({
    top: [['x', '.', '.', '.', '.'], 1, 0, 1],
    middle: [['.', '.', 'x', '.', '.'], 1, 2, 1],
    bottom: [['.', '.', '.', '.', 'x'], 1, 4, 1],
  });

  testVAlign(
    '1x2_0.1 ⇒ 1x5',
    ['x', ''],
    5,
  )({
    top: [['x', '.', '.', '.', '.'], 0, 0, 1],
    middle: [['.', '.', 'x', '.', '.'], 0, 2, 1],
    bottom: [['.', '.', '.', '.', 'x'], 0, 4, 1],
  });

  testVAlign(
    '1x4_1.2 ⇒ 1x9',
    ['', 'x', '', ''],
    9,
  )({
    top: [['x', ...nDots(8)], 1, 0, 1],
    middle: [[...nDots(4), 'x', ...nDots(4)], 1, 4, 1],
    bottom: [[...nDots(8), 'x'], 1, 8, 1],
  });

  testVAlign(
    '2x3_1.0 ⇒ 2x4',
    ['', ' x', 'y '],
    4,
  )({
    top: [['.x', 'y.', '..', '..'], 2, 0, 2],
    middle: [['..', '.x', 'y.', '..'], 2, 2, 2],
    bottom: [['..', '..', '.x', 'y.'], 2, 4, 2],
  });

  testVAlign(
    'remove some gaps',
    ['', '', 'x', 'y', ''],
    4,
  )({
    top: [['x', 'y', '.', '.'], 2, 0, 2],
    middle: [['.', 'x', 'y', '.'], 2, 1, 2],
    bottom: [['.', '.', 'x', 'y'], 2, 2, 2],
  });

  testVAlign(
    'remove all gaps',
    ['', '', 'x', 'y', ''],
    2,
  )({
    top: [['x', 'y'], 2, 0, 2],
    middle: [['x', 'y'], 2, 0, 2],
    bottom: [['x', 'y'], 2, 0, 2],
  });

  testVAlign(
    'crop 1 line from middle aligned',
    ['', 'x', 'y', 'z', '', ''],
    2,
  )({
    top: [['x', 'y'], 1, 0, 2],
    middle: [['x', 'y'], 1, 0, 2],
    bottom: [['y', 'z'], 2, 0, 2],
  });

  testVAlign(
    'crop 2 lines from top aligned',
    ['x', 'y', 'z', ''],
    1,
  )({
    top: [['x'], 0, 0, 1],
    middle: [['y'], 1, 0, 1],
    bottom: [['z'], 2, 0, 1],
  });
});

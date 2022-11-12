import ansis from 'ansis';
import { HAlign } from 'src/align';
import * as CE from 'src/cell';
import { Cell } from 'src/cell';
import * as ST from 'src/style';
import { assert, suite, test } from 'vitest';
import { parseRows } from '../parse';
import * as TY from '../types';
import { Grid } from '../types';
import * as HE from './helpers';

const plainWideCell: Cell = [ST.empty, '🙂', 'wide'];

const ansisRed = ansis.hex('#ff0000');

const checkGrid = (name: string, actual: string[], expect: Grid) =>
  test(name, () => HE.gridEq(parseRows('left', actual), expect));

const checkCells = (name: string, actual: string[], expect: Cell[][]) =>
  test(name, () =>
    assert.deepEqual(TY.unpack(parseRows('left', actual)), expect),
  );

suite('grid parse', () => {
  checkGrid('empty', [], TY.empty());

  suite('single', () => {
    checkGrid('none', [' '], TY.oneCell(CE.none));
    checkGrid('plain narrow', ['x'], TY.oneCell(CE.plainChar('x')));
    checkCells('plain wide', ['🙂'], [[plainWideCell, CE.cont]]);

    checkCells(
      '2 emojis',
      ['🙂😢'],
      [[plainWideCell, CE.cont, [ST.empty, '😢', 'wide'], CE.cont]],
    );

    checkCells(
      '3 emojis',
      ['🙂😢😁'],
      [
        [
          plainWideCell,
          CE.cont,
          [ST.empty, '😢', 'wide'],
          CE.cont,
          [ST.empty, '😁', 'wide'],
          CE.cont,
        ],
      ],
    );

    suite('red', () => {
      checkGrid(
        'narrow',
        [ansisRed('x')],
        TY.oneCell([[0xff_00_00_ff, 0, 0], 'x', 'char']),
      );

      checkGrid(
        'narrow bold',
        [ansisRed.bold('x')],
        TY.oneCell([[0xff_00_00_ff, 0, 1], 'x', 'char']),
      );
    });
  });

  suite('jagged rows', () => {
    suite('narrow', () => {
      const testNarrow = (hAlign: HAlign, actual: string[]) =>
        HE.testPaint(hAlign, parseRows(hAlign, ['a', 'xyz']), actual);

      testNarrow('left', ['a..', 'xyz']);
      testNarrow('center', ['.a.', 'xyz']);
      testNarrow('right', ['..a', 'xyz']);
    });

    suite('wide', () => {
      suite('before narrow', () => {
        const testNarrow = (hAlign: HAlign, actual: string[]) =>
          HE.testPaint(hAlign, parseRows(hAlign, ['🙂x']), actual);

        testNarrow('left', ['🙂x']);
        testNarrow('center', ['🙂x']);
        testNarrow('right', ['🙂x']);
      });

      suite('after narrow', () => {
        const testNarrow = (hAlign: HAlign, actual: string[]) =>
          HE.testPaint(hAlign, parseRows(hAlign, ['a', 'x🙂']), actual);

        testNarrow('left', ['a..', 'x🙂']);
        testNarrow('center', ['.a.', 'x🙂']);
        testNarrow('right', ['..a', 'x🙂']);
      });
    });
  });
});

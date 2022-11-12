import { align as AL, HAlign } from 'src/align';
import { Pair } from 'util/tuple';
import { assert, suite, test } from 'vitest';
import { hAlignRow } from '../hAlignRow';
import * as PA from '../parse';
import * as TY from '../types';
import { Grid } from '../types';
import { testPaint } from './helpers';

suite('grid hAlignRow', () => {
  suite('hAlignRow', () => {
    suite('empty', () => {
      const grids: Pair<Grid> = [
          PA.parseRows('left', ['', 'ab']),
          TY.sized({ width: 3, height: 2 }),
        ],
        row1 = hAlignRow('left', grids)([0, 0]),
        row2 = hAlignRow('left', grids)(row1),
        [, write] = grids;

      test('read/write indexes', () =>
        assert.deepEqual(
          [row1, row2],
          [
            [2 * 4, 3 * 4],
            [2 * 2 * 4, 2 * 3 * 4],
          ],
        ));

      testPaint('paint', write, ['...', 'ab.']);
    });

    suite('crop', () => {
      const makeGrids = (): Pair<Grid> => [
        PA.parseRows('left', ['abcde']),
        TY.sized({ width: 2, height: 1 }),
      ];

      const makeIut = (hAlign: HAlign): [Pair<number>, Grid] => {
        const grids = makeGrids(),
          row1 = hAlignRow(hAlign, grids)([0, 0]),
          [, write] = grids;
        return [row1, write];
      };

      const checkIndexes = (row1: Pair<number>) =>
        test('read/write indexes', () =>
          assert.deepEqual(row1, [5 * 4, 2 * 4]));

      suite('left', () => {
        const [row1, write] = makeIut('left');
        checkIndexes(row1);
        testPaint('paint', write, ['ab']);
      });

      suite('center', () => {
        const [row1, write] = makeIut('center');
        checkIndexes(row1);
        testPaint('paint', write, ['cd']);
      });

      suite('right', () => {
        const [row1, write] = makeIut('right');
        checkIndexes(row1);
        testPaint('paint', write, ['de']);
      });
    });

    suite('non empty', () => {
      const grids: Pair<Grid> = [
          PA.parseRows('left', ['a', 'bc', 'def', 'g i']),
          TY.sized({ width: 4, height: 4 }),
        ],
        [, write] = grids,
        align = (align: HAlign) => hAlignRow(align, grids);

      suite('hAlign=' + AL.hAlignSym.left, () => {
        const aligned = (indexes: Pair<number>) => align('left')(indexes);

        const row1 = aligned([0, 0]),
          row2 = aligned(row1),
          row3 = aligned(row2),
          row4 = aligned(row3);

        const expect = (row: number) => [3 * 4 * row, 4 * 4 * row];

        test('indexes', () =>
          assert.deepEqual(
            [row1, row2, row3, row4],
            [expect(1), expect(2), expect(3), expect(4)],
          ));

        testPaint('paint', write, ['a...', 'bc..', 'def.', 'g.i.']);
      });
    });
  });
});

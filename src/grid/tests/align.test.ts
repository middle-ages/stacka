import { array as AR, function as FN } from 'fp-ts';
import { pos as PO, size as SZ } from 'src/geometry';
import { Grid, cell, grid, row, Row } from 'src/grid';
import { assert, suite, test } from 'vitest';

suite('grid align', () => {
  suite('expandGrid', () => {
    /*
     * ```txt
     *            ▕←  bounds 14x9 →▏
     *
     *           left 2     right 7
     *            ▕←→▏     ▕←     →▏
     *  ▁▁▁▁▁▁▁▁  ┌────────────────┐  ▁
     *    ↑       │   14x9         │
     *  top 3     │                │
     *    ↓       │                │
     *  ────────  │  ┌─────┐       │
     *    ↑       │  │     │       │
     *            │  │     │       │
     *  grid      │  │ 5x6 │       │
     *  height 6  │  │     │       │
     *            │  │     │       │
     *            │  │     │       │
     *    ↓       │  └─────┘       │ grid bottom 0
     *  ▔▔▔▔▔▔▔▔  └────────────────┘
     *               ▕←   →▏
     *                grid
     *               width 5
     *
     * ```
     */
    const size = SZ(14, 9),
      pos = PO(3, 2),
      contentRow = cell.parseRow('ABCDE'),
      grid5x6: Grid = AR.replicate(6, contentRow);

    const actual = FN.pipe(grid5x6, grid.expandGrid(pos, size));

    const emptyRow = row.emptyN(size.width);

    const nonEmptyRow: Row = [
      ...row.emptyN(2),
      ...contentRow,
      ...row.emptyN(7),
    ];

    const expect = [
      ...AR.replicate(3, emptyRow),
      ...AR.replicate(6, nonEmptyRow),
    ];

    test('grid size', () =>
      assert.deepEqual(grid.measureAligned(actual), size));

    test('grid', () => assert.deepEqual(actual, expect));
  });
});

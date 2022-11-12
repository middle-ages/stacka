import { bold, magenta } from 'ansis/colors';
import { array as AR } from 'fp-ts';
import { flow, pipe } from 'fp-ts/lib/function';
import { border, Box, box, color } from 'src/stacka';

const cellWidth = 5;

const greekCells: (string | undefined)[][] = pipe([
  ['αβ', 'γδ', 'εζ'],
  ['ηθ', undefined, 'ικ'],
  ['λμ', 'νξ', 'οπ'],
]);

const innerCell = (addWidth = 0, addHeight = 0) =>
  flow(
    box.of,
    box.width.set(cellWidth + addWidth),
    box.addHeight(addHeight),
    box.center,
    box.colorBg(color.grays[5]),
  );

const table: (boxes: Box[][]) => Box = flow(
  AR.map(box.catSnugRightOf),
  AR.map(box.blendScreen),
  box.catSnugBelow,
  box.blend.set('multiply'),
);

const smallTable: Box = pipe(
  [
    [`1`, `2`],
    [`3`, `4`],
  ],
  pipe(flow(bold, magenta, innerCell(), border.line), AR.map, AR.map),
  table,
);

const { width, height } = box.size.get(smallTable),
  [spanWidth, spanHeight] = [Math.floor(width / 2), Math.floor(height / 2)];

const outerCell = (colIdx: number, rowIdx: number) => (s: string) =>
  pipe(
    s,
    innerCell(colIdx === 1 ? spanWidth : 0, rowIdx === 1 ? spanHeight : 0),
    border.withFg(
      colIdx === 2 ? 'line' : rowIdx === 2 ? 'thick' : 'hThick',
      color.semiTransparent(
        rowIdx ? (colIdx ? 'lightgray' : 'magenta') : 'cyan',
      ),
    ),
  );

const greekTable = pipe(
  greekCells,
  AR.mapWithIndex((rowIdx, row) =>
    pipe(
      row,
      AR.mapWithIndex((colIdx, cell) =>
        cell === undefined ? smallTable : pipe(cell, outerCell(colIdx, rowIdx)),
      ),
    ),
  ),
  table,
);

box.print(greekTable);

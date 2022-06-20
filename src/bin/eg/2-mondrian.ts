import { function as FN } from 'fp-ts';
import { box, Box, Color, color } from 'src/stacka';

/*
                 ┆    col23  ┆
┄┄┄┄┄╴┌──────────┬───────────┐╶┄┄┄┄
      │    A     │           │ row1
row12 ├──────────┤    D      │╶┄┄┄┄
      │    B     │           │ row2
┄┄┄┄┄╴├──────────┼──────┬────┤╶┄┄┄┄
      │          │      │  F │ row3
row34 │    C     │   E  ├────┤╶┄┄┄┄
      │          │      │  G │ row4
┄┄┄┄┄╴└──────────┴──────┴────┘╶┄┄┄┄
      ┆   col1   ┆ col2 ┆col3┆
*/

const [hGap, vGap] = [2, 1],
  [col1, col2, col3] = [5, 10, 6],
  [row1, row2, row3, row4] = [4, 4, 1, 2];

const col23 = col2 + col3 + hGap,
  row12 = row1 + row2 + vGap,
  row34 = row3 + row4 + vGap;

const A = cell('A', [col1, row1], 'white'),
  B = cell('B', [col1, row2], 'white'),
  C = cell('C', [col1, row34], 'blue'),
  D = cell('D', [col23, row12], 'red'),
  E = cell('E', [col2, row34], 'white'),
  F = cell('F', [col3, row3], 'white'),
  G = cell('G', [col3, row4], 'yellow');

FN.pipe(
  FN.pipe([A, B, C], box.catBelowGap(vGap)),
  FN.pipe(
    G,
    FN.pipe(F, box.belowGap(vGap)),
    FN.pipe(E, box.rightOfGap(hGap)),
    FN.pipe(D, box.belowGap(vGap)),
    box.leftOfGap(hGap),
  ),
  box.print,
);

function cell(key: string, [width, height]: [number, number], c: Color): Box {
  return box({
    row: color.of(['black', c])(key),
    gridBg: c,
    width,
    height,
  });
}

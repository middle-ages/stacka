import { array as AR, function as FN, tuple as TU } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { dup, mapBoth } from 'fp-ts-std/Tuple';
import { splitAt } from 'fp-ts/lib/Array';
import { bitmap } from 'src/bitmap';
import { hex, color as co, Color } from 'src/color';
import { grid as GR, Cell, Row, cell } from 'src/grid';
import { mapRange } from 'util/array';
import { BinaryC, Unary } from 'util/function';
import { Pair, Tuple4 } from 'util/tuple';
import { Backdrop, center, repeat, stretch } from './types';

export const empty: Backdrop = center([[]]);

export const repeatCell: Unary<Cell, Backdrop> = FN.flow(AR.of, AR.of, repeat);

export const repeatNarrow: Unary<string, Backdrop> = FN.flow(
  GR.cell.plainNarrow,
  repeatCell,
);

export const visible: Backdrop = repeatNarrow('.');

export const coloredChar: BinaryC<Color, string, Backdrop> = c =>
  FN.flow(FN.pipe(c, GR.style.fromFg, GR.cell.narrow), repeatCell);

export const [solidFg, solidBg]: Pair<Unary<Color, Backdrop>> = [
  FN.pipe('█', flip(coloredChar)),
  FN.flow(GR.cell.bgSpace, repeatCell),
];

export const halfCheckers: Backdrop = FN.pipe(
  ['black', 'white'],
  GR.cell.colored('▚'),
  repeatCell,
);

export const altRows: Unary<Color[], Backdrop> = FN.flow(
    AR.map(FN.flow(GR.cell.bgSpace, AR.of)),
    repeat,
  ),
  evenOddRows: Unary<Pair<Color>, Backdrop> = altRows;

export const altColumns: Unary<Color[], Backdrop> = FN.flow(
    AR.map(GR.cell.bgSpace),
    AR.of,
    repeat,
  ),
  evenOddColumns: Unary<Pair<Color>, Backdrop> = altColumns;

/**
 * Just like `AltRows`, but repeat the row for each color, each time
 * shifting it left by one character.
 *
 * For example, if given the color list `['red','green', 'blue']`, this is the
 * backdrop image that will be repeated, with `R`, `G`, and `B` meaning `red`,
 * `green`, and `blue` respectively:
 *
 * ```txt
 * RGB
 * GBR
 * BRG
 * ```
 */
export const altCells: Unary<Color[], Backdrop> = colors =>
  FN.pipe(
    FN.flow(
      FN.pipe(colors, flip<number, Color[], Pair<Color[]>>(splitAt)),
      TU.swap,
      AR.flatten,
      AR.map(cell.bgSpace),
    ),
    FN.pipe([0, colors.length - 1], flip(mapRange<Row>)),
    repeat,
  );

export const checkers1x1: Backdrop = altCells([co.hex('#00000000'), 'white']);

export const checkersMxN: Unary<Pair<number>, Backdrop> = ([m, n]) => {
  const replicateM = <T>(v: T): T[] => AR.replicate(m, v);
  const replicateN = <T>(v: T): T[] => AR.replicate(n, v);

  const headRow: Pair<Cell[]> = FN.pipe(
    FN.pipe(['white', 'black'], mapBoth(GR.cell.bgSpace), mapBoth(replicateM)),
  );
  return FN.pipe(
    [
      ...FN.pipe(headRow, AR.flatten, replicateN),
      ...FN.pipe(headRow, TU.swap, AR.flatten, replicateN),
    ],
    repeat,
  );
};

export const checkersNxN: Unary<number, Backdrop> = FN.flow(dup, checkersMxN);

/**
 * Divide box into 4 quadrants and paint each of them with cyan, magenta, pink
 * and black
 * */
export const cmykQuadrants: Backdrop = (() => {
  const [c, m, y, k]: Tuple4<Color> = [
    hex('#00ffffff'),
    hex('#ff00ffff'),
    hex('#ffff00ff'),
    'black',
  ];

  const sp = GR.cell.bgSpace;
  return stretch([
    [sp(c), sp(m)],
    [sp(y), sp(k)],
  ]);
})();

export const charGrid = FN.pipe(
  bitmap.cross,
  co.of(['green', 'black']),
  GR.cell.parseRow,
  AR.of,
  repeat,
);

export const grid = FN.pipe(
  bitmap.cross + bitmap.line.horizontal,
  co.of(['black', 'white']),
  GR.cell.parseRow,
  AR.of,
  repeat,
);

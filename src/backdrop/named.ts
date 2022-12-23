import {
  predicate as PRE,
  array as AR,
  function as FN,
  tuple as TU,
} from 'fp-ts';
import { transpose } from 'fp-ts-std/Array';
import { flip } from 'fp-ts-std/Function';
import { dup, mapBoth } from 'fp-ts-std/Tuple';
import { splitAt } from 'fp-ts/lib/Array';
import { bitmap } from 'src/bitmap';
import * as CE from 'src/cell';
import { Cell } from 'src/cell';
import * as CO from 'src/color';
import { Color } from 'src/color';
import * as GR from 'src/grid';
import { head, mapRange } from 'util/array';
import { BinaryC, Unary } from 'util/function';
import { Pair, Tuple4 } from 'util/tuple';
import { Backdrop, buildBackdrop, repeat, stretch } from './types';

export const empty: Backdrop = buildBackdrop('center')(GR.empty());

export const isEmpty: PRE.Predicate<Backdrop> = b => GR.isEmpty(b.image);

export const repeatCell: Unary<Cell, Backdrop> = FN.flow(GR.oneCell, repeat);

export const repeatNarrow: Unary<string, Backdrop> = FN.flow(
  CE.plainChar,
  repeatCell,
);

export const visible: Backdrop = repeatNarrow('.');

export const coloredChar: BinaryC<Color, string, Backdrop> = c =>
  FN.flow(CE.fgChar(c), head, repeatCell);

export const [solidFg, solidBg]: Pair<Unary<Color, Backdrop>> = [
  FN.pipe(bitmap.solid, flip(coloredChar)),
  FN.flow(GR.spaceBg, repeat),
];

export const halfCheckers: Backdrop = FN.pipe(
  '▚',
  CE.colored(['black', 'white']),
  head,
  repeatCell,
);

export const colorHalfCheckers: Unary<Color, Backdrop> = c =>
  FN.pipe('▚', CE.colored(['black', c]), head, repeatCell);

export const altRows: Unary<Color[], Backdrop> = FN.flow(
  AR.map(dup),
  FN.pipe(bitmap.solid, flip(CE.colored), AR.map),
  GR.pack,
  repeat,
);

export const evenOddRows: Unary<Pair<Color>, Backdrop> = altRows;

export const altColumns: Unary<Color[], Backdrop> = FN.flow(
  AR.map(dup),
  FN.pipe(bitmap.solid, flip(CE.colored), AR.map),
  transpose,
  GR.pack,
  repeat,
);

export const evenOddColumns: Unary<Pair<Color>, Backdrop> = altColumns;

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
      AR.map(CE.spaceBg),
    ),
    FN.pipe([0, colors.length - 1], flip(mapRange<Cell[]>)),
    GR.pack,
    repeat,
  );

export const checkers1x1: Backdrop = altCells([0xff_00_00_00, 0xff_ff_ff_ff]);

export const checkersMxN: Unary<Pair<number>, Backdrop> = ([m, n]) => {
  const replicateM = <T>(v: T): T[] => AR.replicate(m, v);
  const replicateN = <T>(v: T): T[] => AR.replicate(n, v);

  const headRow: Pair<Cell[]> = FN.pipe(
    FN.pipe(['white', 'black'], mapBoth(CE.spaceBg), mapBoth(replicateM)),
  );

  return FN.pipe(
    [
      ...FN.pipe(headRow, AR.flatten, replicateN),
      ...FN.pipe(headRow, TU.swap, AR.flatten, replicateN),
    ],
    GR.pack,
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
    0xff_ff_ff_00, 0xff_ff_00_ff, 0xff_00_ff_ff, 0xff_00_00_00,
  ];

  const sp = CE.spaceBg;
  return FN.pipe(
    [
      [sp(c), sp(m)],
      [sp(y), sp(k)],
    ],
    GR.pack,
    stretch,
  );
})();

export const charGrid = FN.pipe(
  bitmap.cross,
  CO.of(['black', 'white']),
  GR.parseRow,
  repeat,
);

export const grid = FN.pipe(
  bitmap.cross + bitmap.line.horizontal,
  CO.of(['black', 'white']),
  GR.parseRow,
  repeat,
);

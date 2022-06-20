import { array as AR, function as FN, option as OP, tuple as TU } from 'fp-ts';
import { flip, uncurry2 } from 'fp-ts-std/Function';
import stringWidth from 'string-width';
import { addAfter, addBefore, head } from 'util/array';
import { colorize } from 'util/color';
import { Binary, BinaryC, Endo, Unary, λk } from 'util/function';
import { around, Char, MaybeChar, replicateOrSpace } from 'util/string';
import { Pair } from 'util/tuple';
import { Dir, HDir, mapHDirs, mapVDirs, VDir } from '../dir';
import { RowList, RowMapper } from '../types';
import { addCorners, hasBorderAt } from './part';
import { Border, getBorderAt } from './types';

const renderPart = (dir: Dir, b: Border, width: number): string => {
  const [c, s] = FN.pipe(b, getBorderAt(dir));
  return FN.pipe(c, flip(replicateOrSpace)(width), colorize(s));
};

const makeHLine =
  (b: Border): BinaryC<number, VDir, MaybeChar> =>
  width =>
  dir =>
    hasBorderAt(b)(dir)
      ? FN.pipe(renderPart(dir, b, width), addCorners(b, dir), OP.some)
      : OP.none;

const makeHLines: Binary<Border, RowList, Pair<string[]>> = (b, rows) =>
  mapVDirs(
    FN.flow(
      FN.pipe(rows, head, stringWidth, makeHLine(b)),
      OP.map(AR.of),
      FN.pipe([] as string[], λk, OP.getOrElse),
    ),
  );

const makeVLine: BinaryC<Border, HDir, Char> = b => dir =>
  hasBorderAt(b)(dir) ? renderPart(dir, b, 1) : '';

const addVLines: Unary<Border, Endo<RowList>> = FN.flow(
  makeVLine,
  mapHDirs,
  FN.tupled(around),
  AR.map,
);

export const paintBorder: Unary<Border, RowMapper> = b => rows =>
  AR.isEmpty(rows)
    ? []
    : FN.pipe(
        makeHLines(b, rows),
        FN.pipe(rows, addVLines(b), addAfter, TU.mapFst),
        uncurry2(addBefore),
      );

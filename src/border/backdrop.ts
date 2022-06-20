import { function as FN, option as OP } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Box, box, BoxSet } from 'src/box';
import { Color, OpacityLevel } from 'src/color';
import { Cell, grid, Style } from 'src/grid';
import { BinaryC, Endo, Unary } from 'util/function';
import { mapValues } from 'util/object';
import { Pair, Tuple3, tuple3Map } from 'util/tuple';
import { fromCells } from './build';
import { basicBorderChars } from './sets';
import { Border, BorderName } from './types';

export const withStyle: BinaryC<Unary<string, Cell>, BorderName, Border> = f =>
  FN.flow(basicBorderChars, mapValues(f), fromCells);

export const withFg: BinaryC<Color, BorderName, Border> = FN.flow(
  flip(grid.cell.fgChar),
  withStyle,
);

const fromBoxOp: Unary<Endo<Box>, Endo<Border>> = FN.flow(OP.map, mapValues);

const fromUnaryBoxOp = <T>(f: BoxSet<T>): Unary<T, Endo<Border>> =>
  FN.flow(f, OP.map, mapValues);

export const [setFg, setBg]: Pair<Unary<Color, Endo<Border>>> = FN.pipe(
    [box.setGridFg, box.setGridBg],
    mapBoth(fromUnaryBoxOp),
  ),
  setColor: Unary<Pair<Color>, Endo<Border>> = ([fg, bg]) =>
    FN.flow(setFg(fg), setBg(bg));

export const [setSolidFg, setSolidBg]: Pair<Unary<Color, Endo<Border>>> =
  FN.pipe([box.setSolidFg, box.setSolidBg], mapBoth(fromUnaryBoxOp));

export const [unsetFg, unsetBg, unsetColor]: Tuple3<Endo<Border>> = FN.pipe(
  [box.unsetGridFg, box.unsetGridBg, box.unsetGridColor],
  tuple3Map(fromBoxOp),
);

export const [setFgOpacity, setBgOpacity]: Pair<
  Unary<OpacityLevel, Endo<Border>>
> = FN.pipe(
  [box.setGridFgOpacity, box.setGridBgOpacity],
  mapBoth(fromUnaryBoxOp),
);

export const setStyle: Unary<Style, Endo<Border>> = fromUnaryBoxOp(
  box.setGridStyle,
);

import { array as AR, function as FN, option as OP, tuple as TU } from 'fp-ts';
import { unlines } from 'fp-ts-std/String';
import { BlendMode, Color } from 'src/color';
import { Size, size } from 'src/geometry';
import { head, map2 } from 'util/array';
import { Pair, Tuple3 } from 'util/tuple';
import { BinaryC, BinOpT, Endo, Unary } from 'util/function';
import { Cell, cell, Styled } from './cell/cell';
import { row } from './row/row';
import { style as ST, Style } from './style/style';
import { Grid } from './types';

export const empty: Grid = [],
  fillEmpty: Unary<Size, Grid> = ({ width, height }) =>
    AR.replicate(height, row.emptyN(width));

export const parseRow: Unary<string, Grid> = FN.flow(cell.parseRow, AR.of),
  parseRows: Unary<string[], Grid> = AR.chain(parseRow);

export const stack: Unary<BlendMode, BinOpT<Grid>> =
  blend =>
  ([below, above]) =>
    AR.isEmpty(above)
      ? below
      : AR.isEmpty(below)
      ? above
      : FN.pipe(below, AR.zip(above), FN.pipe(blend, row.stack, AR.map));

export const measureAligned: Unary<Grid, Size> = g => {
  const height = g.length;
  return height === 0 ? size.empty : size(g[0].length, height);
};

export const measure: Unary<Grid, Size> = g => {
  const height = g.length;
  return height === 0 ? size.empty : size(row.maxRowWidth(g), height);
};

export const asStringsWith: BinaryC<string, Grid, string[]> = FN.flow(
    row.asStringWith,
    AR.map,
  ),
  asStrings = asStringsWith(' '),
  asString: Unary<Grid, String> = FN.flow(asStrings, unlines);

export const mapCells = <R>(f: Unary<Cell, R>): Unary<Grid, R[][]> => map2(f);

export const modCells: Unary<Unary<Cell, Cell[]>, Endo<Grid>> = FN.flow(
  AR.map,
  AR.chain,
);

export const modEmpty: Unary<Cell, Endo<Grid>> = c =>
  modCells(
    cell.matchCell(
      () => [c],
      (_, c) => [c],
      (_, ...rest) => [TU.snd(rest)],
      (_, c) => [c],
    ),
  );

export const modStyled: Unary<Endo<Styled>, Endo<Grid>> = f =>
  modCells(ce =>
    FN.pipe(
      ce,
      cell.matchCell(
        FN.constant(cell.empty as Cell),
        (_, c) => {
          const { style, char } = f(c);
          return FN.pipe(char, cell.fromChar(style), head);
        },
        (_, ...rest) => {
          const { style, char } = FN.pipe(rest, TU.snd, f);
          return FN.pipe(char, cell.fromChar(style), head);
        },
        (_, c) => c,
      ),
      ce => (cell.isWide(ce) ? cell.attachCont(ce) : [ce]),
    ),
  );

export const modChar: Unary<Endo<string>, Endo<Grid>> = f =>
    modStyled(({ char, ...rest }) => ({ char: f(char), ...rest })),
  modStyle: Unary<Endo<Style>, Endo<Grid>> = f =>
    modStyled(({ style, ...rest }) => ({ style: f(style), ...rest }));

export const setStyle: Unary<Style, Endo<Grid>> = FN.flow(
    FN.constant,
    modStyle,
  ),
  setChar: Unary<string, Endo<Grid>> = FN.flow(FN.constant, modChar),
  setFg: Unary<Color, Endo<Grid>> = FN.flow(OP.some, ST.fg.set, modStyle),
  setBg: Unary<Color, Endo<Grid>> = FN.flow(OP.some, ST.bg.set, modStyle),
  [unsetFg, unsetBg, unsetColor]: Tuple3<Endo<Grid>> = [
    modStyle(ST.unsetFg),
    modStyle(ST.unsetBg),
    modStyle(ST.unsetColor),
  ],
  [setFgOpacity, setBgOpacity] = [
    FN.flow(ST.setFgOpacity, modStyle),
    FN.flow(ST.setBgOpacity, modStyle),
  ];

export const setColor: Unary<Pair<Color>, Endo<Grid>> = ([fg, bg]) =>
  FN.flow(setFg(fg), setBg(bg));

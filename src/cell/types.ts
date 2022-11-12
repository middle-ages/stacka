import { function as FN } from 'fp-ts';
import { Color } from 'src/color';
import { Endo, Unary } from 'util/function';
import * as style from 'src/style';
import { Deco, Style } from 'src/style';
import * as TY from './type';
import { CellType } from './type';

export type Cell = [style: Style, rune: string, type: CellType];

export const [getStyle, getFg, getBg, getDeco, getRune, getCellType]: [
  Unary<Cell, Style>,
  Unary<Cell, Color>,
  Unary<Cell, Color>,
  Unary<Cell, Deco>,
  Unary<Cell, string>,
  Unary<Cell, CellType>,
] = [c => c[0], c => c[0][0], c => c[0][1], c => c[0][2], c => c[1], c => c[2]];

export const [setStyle, setFg, setBg, setDeco, setRune, setCellType]: [
  Unary<Style, Endo<Cell>>,
  Unary<Color, Endo<Cell>>,
  Unary<Color, Endo<Cell>>,
  Unary<Deco, Endo<Cell>>,
  Unary<string, Endo<Cell>>,
  Unary<CellType, Endo<Cell>>,
] = [
  st =>
    ([, ...rest]) =>
      [st, ...rest],
  cb =>
    ([st, ...rest]) =>
      [style.setFg(cb)(st), ...rest],
  cb =>
    ([st, ...rest]) =>
      [style.setBg(cb)(st), ...rest],
  deco =>
    ([st, ...rest]) =>
      [style.setDeco(deco)(st), ...rest],
  char =>
    ([st, , type]) =>
      [st, char, type],
  type =>
    ([st, deco]) =>
      [st, deco, type],
];

export const matchCell =
  <R>(
    onNone: R,
    onChar: Unary<Cell, R>,
    onWide: Unary<Cell, R>,
    onCont: R,
  ): Unary<Cell, R> =>
  cell =>
    FN.pipe(
      cell,
      getCellType,
      TY.matchCellType(onNone, onChar(cell), onWide(cell), onCont),
    );

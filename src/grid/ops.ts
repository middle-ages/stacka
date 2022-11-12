import { function as FN } from 'fp-ts';
import { Color } from 'src/color';
import * as CO from 'src/color';
import * as CE from 'src/cell';
import { Cell } from 'src/cell';
import { Size } from 'src/geometry';
import { Deco, Style } from 'src/style';
import * as ST from 'src/style';
import { repeatSubgrid } from 'util/array';
import { BinaryC, Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import * as MO from './mod';
import * as TY from './types';
import { Grid } from './types';

export const [clearFg, clearBg, clearDeco, clearColor, flip] = [
  MO.modCells(CE.clearFg),
  MO.modCells(CE.clearBg),
  MO.modCells(CE.clearDeco),
  MO.modCells(CE.clearColor),
  MO.modCells(CE.flip),
];

export const get: BinaryC<Pair<number>, Grid, Cell> =
    ([x, y]) =>
    g =>
      CE.readCell(g.buffer)(CE.cellWords * (x + y * g.width)),
  set: BinaryC<Pair<number>, Cell, Unary<Grid, number>> =
    ([x, y]) =>
    c =>
    g =>
      CE.writeCell(g.buffer)(CE.cellWords * (x + y * g.width), c);

/** Repeat and crop the grid so that it fills the given size */
export const repeat: Unary<Size, Endo<Grid>> =
  ({ width, height }) =>
  g =>
    FN.pipe(g, TY.unpack, repeatSubgrid([width, height]), TY.pack);

/** Set the given style on every non-empty cell in the grid */

export const setStyle: Unary<Style, Endo<Grid>> = FN.flow(
    FN.constant,
    MO.modStyle,
  ),
  setRune: Unary<string, Endo<Grid>> = FN.flow(FN.constant, MO.modRune);

/** Set the background color on every non-empty cell in the grid */
export const setBg: Unary<Color, Endo<Grid>> = FN.flow(
    ST.bg.color.set,
    MO.modStyle,
  ),
  /** Set the foreground color on every non-empty cell in the grid */
  setFg: Unary<Color, Endo<Grid>> = FN.flow(ST.fg.color.set, MO.modStyle),
  /** Set the ANSI deco on every non-empty cell in the grid */
  setDeco: Unary<Deco, Endo<Grid>> = FN.flow(ST.setDeco, MO.modStyle),
  /** Set the foreground+background color every non-empty cell in the grid */
  setColor: Unary<Pair<Color>, Endo<Grid>> = ([fg, bg]) =>
    FN.flow(setFg(fg), setBg(bg));

/**
 * replace all empty cells in the grid with a space character painted with the
 * given background color
 */
export const addBg: Unary<Color, Endo<Grid>> = FN.flow(
  CE.spaceBg,
  FN.constant,
  MO.modNone,
);

/**
 * replace all empty cells in the grid with a space character painted with the
 * given background color, and set it on all non-empty cells as well
 *
 */
export const colorBg: Unary<Color, Endo<Grid>> = color =>
  FN.flow(addBg(color), setBg(color));

export const fg = CO.delegateMods(MO.modFg),
  bg = CO.delegateMods(MO.modBg);

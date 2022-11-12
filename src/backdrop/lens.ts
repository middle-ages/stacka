import { function as FN } from 'fp-ts';
import * as GR from 'src/grid';
import * as LE from 'monocle-ts/lib/Lens';
import { Color } from 'src/color';
import * as grid from 'src/grid';
import { Style } from 'src/style';
import { Endo, Unary } from 'util/function';
import { modLens } from 'util/lens';
import { Pair } from 'util/tuple';
import { Backdrop } from './types';

const id = LE.id<Backdrop>();

export type Mod<T> = Unary<T, Endo<Backdrop>>;

export const image = FN.pipe(id, LE.prop('image'), modLens),
  project = FN.pipe(id, LE.prop('project'), modLens);

export const modStyle: Mod<Endo<Style>> = FN.flow(grid.modStyle, image.mod),
  modRune: Mod<Endo<string>> = FN.flow(grid.modRune, image.mod);

export const setStyle: Unary<Style, Endo<Backdrop>> = FN.flow(
    FN.constant,
    modStyle,
  ),
  setRune: Unary<string, Endo<Backdrop>> = FN.flow(FN.constant, modRune),
  [setFg, setBg]: Pair<Unary<Color, Endo<Backdrop>>> = [
    FN.flow(grid.setFg, image.mod),
    FN.flow(grid.setBg, image.mod),
  ],
  colorBg = FN.flow(grid.colorBg, image.mod);

export const [clearFg, clearBg, clearDeco, clearColor, flip] = [
  image.mod(GR.clearFg),
  image.mod(GR.clearBg),
  image.mod(GR.clearDeco),
  image.mod(GR.clearColor),
  image.mod(GR.flip),
];

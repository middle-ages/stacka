import { function as FN } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import * as LE from 'monocle-ts/lib/Lens';
import { Color, OpacityLevel } from 'src/color';
import { grid, Style } from 'src/grid';
import { Endo, Unary } from 'util/function';
import { modLens } from 'util/lens';
import { flowPair, Pair } from 'util/tuple';
import { Backdrop } from './types';

const id = LE.id<Backdrop>();

export type Mod<T> = Unary<T, Endo<Backdrop>>;

export const image = FN.pipe(id, LE.prop('image'), modLens),
  project = FN.pipe(id, LE.prop('project'), modLens);

export const modStyle: Mod<Endo<Style>> = FN.flow(grid.modStyle, image.mod),
  modChar: Mod<Endo<string>> = FN.flow(grid.modChar, image.mod);

export const setGridStyle: Unary<Style, Endo<Backdrop>> = FN.flow(
    FN.constant,
    modStyle,
  ),
  setGridChar: Unary<string, Endo<Backdrop>> = FN.flow(FN.constant, modChar),
  [setGridFg, setGridBg]: Pair<Unary<Color, Endo<Backdrop>>> = [
    FN.flow(grid.setFg, image.mod),
    FN.flow(grid.setBg, image.mod),
  ],
  setGridColor: Unary<Pair<Color>, Endo<Backdrop>> = ([fg, bg]) =>
    FN.flow(setGridFg(fg), setGridBg(bg)),
  [setGridFgOpacity, setGridBgOpacity] = [
    FN.flow(grid.setFgOpacity, image.mod),
    FN.flow(grid.setBgOpacity, image.mod),
  ];

export const setOpacity: Unary<OpacityLevel, Endo<Backdrop>> = FN.flow(
  fork([setGridFgOpacity, setGridBgOpacity]),
  flowPair,
);

export const [unsetGridFg, unsetGridBg, unsetGridColor] = [
  image.mod(grid.unsetFg),
  image.mod(grid.unsetBg),
  image.mod(grid.unsetColor),
];

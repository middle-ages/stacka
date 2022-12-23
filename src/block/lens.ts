import { function as FN, readonlyArray as RA } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import * as LE from 'monocle-ts/lib/Lens';
import * as AL from 'src/align';
import { Align } from 'src/align';
import * as BD from 'src/backdrop';
import { Backdrop } from 'src/backdrop';
import * as CO from 'src/color';
import { Color } from 'src/color';
import * as GE from 'src/geometry';
import * as GR from 'src/grid';
import { Grid } from 'src/grid';
import { callWith, Endo, Unary } from 'util/function';
import { ModLens, modLens } from 'util/lens';
import { appendTuple, Pair, TupleN } from 'util/tuple';
import { rect, rectLenses as rectLensesOf } from './rect';
import { Block } from './types';

const id = LE.id<Block>();

const rectLenses = rectLensesOf(rect);

export const [align, backdrop]: [
  ModLens<Block, Align>,
  ModLens<Block, Backdrop>,
] = FN.pipe(
  id,
  fork([
    FN.flow(LE.prop('align'), modLens),
    FN.flow(LE.prop('backdrop'), modLens),
  ]),
);

export const lenses = {
  ...rectLenses,
  align,
  backdrop,
  grid: FN.pipe(id, LE.prop('grid'), modLens),
  blend: FN.pipe(id, LE.prop('blend'), modLens),
  hAlign: FN.pipe(align, LE.compose(AL.align.hLens), modLens),
  vAlign: FN.pipe(align, LE.compose(AL.align.vLens), modLens),
  image: FN.pipe(backdrop, LE.compose(BD.image), modLens),
  project: FN.pipe(backdrop, LE.compose(BD.project), modLens),
} as const;

export type Lenses = typeof lenses;
export type LensKey = keyof Lenses;

export const { grid, blend, hAlign, vAlign, image, project } = lenses;

export const measureGrid: Unary<Block, GE.Size> = FN.flow(grid.get, GR.size),
  resetSize: Endo<Block> = callWith(FN.flow(measureGrid, rectLenses.size.set));

export const blends = FN.pipe(
  ['normal', 'screen', 'over', 'under', 'combineOver', 'combineUnder'] as const,
  RA.map(lenses.blend.set),
) as TupleN<Endo<Block>, 6>;

const alignGridMod: Endo<Block> = b => {
  const {
    align,
    rect: { size },
  } = b;
  return grid.mod(GR.alignGrid(align, size))(b);
};

export const mods: TupleN<Endo<Block>, 11> = [
  alignGridMod,
  grid.mod(GR.clearFg),
  grid.mod(GR.clearBg),
  grid.mod(GR.clearDeco),
  grid.mod(GR.clearColor),
  grid.mod(GR.flip),
  backdrop.mod(BD.clearFg),
  backdrop.mod(BD.clearBg),
  backdrop.mod(BD.clearDeco),
  backdrop.mod(BD.clearColor),
  backdrop.mod(BD.flip),
];

export const endomorphisms = appendTuple(mods)(blends);

export const [
  alignGrid,
  clearFg,
  clearBg,
  clearDeco,
  clearColor,
  flipColor,
  clearGridFg,
  clearGridBg,
  clearGridDeco,
  clearGridColor,
  flipGridColor,
  blendNormal,
  blendScreen,
  blendOver,
  blendUnder,
  combineOver,
  combineUnder,
] = endomorphisms;

const withAlign =
  (f: Unary<Color, Endo<Grid>>): Unary<Color, Endo<Block>> =>
  c =>
  b =>
    FN.pipe(
      b,
      FN.pipe(FN.flow(GR.alignGrid(b.align, b.rect.size), f(c)), grid.mod),
    );

export const colorSetters = [
    FN.flow(GR.setFg, grid.mod),
    FN.flow(GR.setBg, grid.mod),
    withAlign(GR.addBg),
    withAlign(GR.colorBg),
    FN.flow(BD.setFg, backdrop.mod),
    FN.flow(BD.setBg, backdrop.mod),
  ],
  [setFg, setBg, addBg, colorBg, setGridFg, setGridBg] = colorSetters;

export const [setStyle, setGridStyle] = [
  FN.flow(GR.setStyle, grid.mod),
  FN.flow(BD.setStyle, backdrop.mod),
];

export const [modFg, modBg]: Pair<Unary<Endo<Color>, Endo<Block>>> = [
  FN.flow(GR.modFg, grid.mod),
  FN.flow(GR.modBg, grid.mod),
];

export const [fg, bg] = [CO.delegateMods(modFg), CO.delegateMods(modBg)];

export const imageSize = FN.flow(image.get, GR.size);

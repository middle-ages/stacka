import { function as FN } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import * as LE from 'monocle-ts/lib/Lens';
import * as AL from 'src/align';
import { Align } from 'src/align';
import { Backdrop, backdrop as BD } from 'src/backdrop';
import { Color } from 'src/color';
import * as GE from 'src/geometry';
import { grid as GR } from 'src/grid';
import { callWith, Endo, Unary } from 'util/function';
import { ModLens, modLens } from 'util/lens';
import { mapValues } from 'util/object';
import { tuple4Map } from 'util/tuple';
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

export const measureGrid: Unary<Block, GE.Size> = FN.flow(grid.get, GR.measure),
  resetSize: Endo<Block> = callWith(FN.flow(measureGrid, rectLenses.size.set));

export const [
    unsetFg,
    unsetBg,
    unsetColor,
    unsetGridFg,
    unsetGridBg,
    unsetGridColor,
  ] = [
    grid.mod(GR.unsetFg),
    grid.mod(GR.unsetBg),
    grid.mod(GR.unsetColor),
    backdrop.mod(BD.unsetGridFg),
    backdrop.mod(BD.unsetGridBg),
    backdrop.mod(BD.unsetGridColor),
  ],
  [blendNormal, blendScreen, blendOver, blendUnder] = FN.pipe(
    ['normal', 'screen', 'over', 'under'],
    tuple4Map(lenses.blend.set),
  ),
  [setFg, setBg, setGridFg, setGridBg, setSolidFg, setSolidBg] = [
    FN.flow(GR.setFg, grid.mod),
    FN.flow(GR.setBg, grid.mod),
    FN.flow(BD.setGridFg, backdrop.mod),
    FN.flow(BD.setGridBg, backdrop.mod),
    FN.flow(BD.solidFg, backdrop.set),
    FN.flow(BD.solidBg, backdrop.set),
  ],
  [setColor, setGridColor] = [
    FN.flow(GR.setColor, grid.mod),
    FN.flow(BD.setGridColor, backdrop.mod),
  ],
  [setFgOpacity, setBgOpacity] = [
    FN.flow(GR.setFgOpacity, grid.mod),
    FN.flow(GR.setBgOpacity, grid.mod),
  ],
  [setStyle, setGridStyle] = [
    FN.flow(GR.setStyle, grid.mod),
    FN.flow(BD.setGridStyle, backdrop.mod),
  ];

// setters to delegate with 0 args
const zeroDelegates = {
  unsetFg,
  unsetBg,

  unsetColor,
  unsetGridFg,
  unsetGridBg,

  unsetGridColor,

  blendNormal,
  blendScreen,
  blendOver,
  blendUnder,
} as const;

// 1 arg color setters to delegate
const colorDelegates = {
  setFg,
  setBg,

  setGridFg,
  setGridBg,

  setSolidFg,
  setSolidBg,
} as const;

export const delegateZero = <T>(
  lens: ModLens<T, Block>,
): Record<keyof typeof zeroDelegates, Endo<T>> =>
  FN.pipe(zeroDelegates, mapValues(lens.mod));

export const delegateColor = <T>(
  lens: ModLens<T, Block>,
): Record<keyof typeof colorDelegates, Unary<Color, Endo<T>>> =>
  FN.pipe(
    colorDelegates,
    mapValues(f => FN.flow(f, lens.mod)),
  );

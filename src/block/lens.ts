import { function as FN } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import * as LE from 'monocle-ts/lib/Lens';
import * as AL from 'src/align';
import { Align } from 'src/align';
import { Backdrop, backdrop as BD } from 'src/backdrop';
import * as GE from 'src/geometry';
import { grid as GR } from 'src/grid';
import { tuple3Map } from 'src/util/tuple';
import { callWith, Endo, Unary } from 'util/function';
import { LensResult, ModLens, modLens } from 'util/lens';
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

export const { grid, blend, hAlign, vAlign, image, project } = lenses;

export const measureGrid: Unary<Block, GE.Size> = FN.flow(grid.get, GR.measure),
  resetSize: Endo<Block> = callWith(FN.flow(measureGrid, rectLenses.size.set));

export const [setFg, setBg, setColor] = [
    FN.flow(GR.setFg, grid.mod),
    FN.flow(GR.setBg, grid.mod),
    FN.flow(GR.setColor, grid.mod),
  ],
  [setGridFg, setGridBg, setGridColor] = [
    FN.flow(BD.setGridFg, backdrop.mod),
    FN.flow(BD.setGridBg, backdrop.mod),
    FN.flow(BD.setGridColor, backdrop.mod),
  ],
  [setSolidFg, setSolidBg] = [
    FN.flow(BD.solidFg, backdrop.set),
    FN.flow(BD.solidBg, backdrop.set),
  ],
  [unsetFg, unsetBg, unsetColor] = [
    grid.mod(GR.unsetFg),
    grid.mod(GR.unsetBg),
    grid.mod(GR.unsetColor),
  ],
  [unsetGridFg, unsetGridBg, unsetGridColor] = [
    backdrop.mod(BD.unsetGridFg),
    backdrop.mod(BD.unsetGridBg),
    backdrop.mod(BD.unsetGridColor),
  ],
  [setFgOpacity, setBgOpacity] = [
    FN.flow(GR.setFgOpacity, grid.mod),
    FN.flow(GR.setBgOpacity, grid.mod),
  ],
  [setStyle, setGridStyle] = [
    FN.flow(GR.setStyle, grid.mod),
    FN.flow(BD.setGridStyle, backdrop.mod),
  ],
  [blendNormal, blendOver, blendUnder] = FN.pipe(
    ['normal', 'over', 'under'],
    tuple3Map(lenses.blend.set),
  );

export type Lenses = typeof lenses;
export type LensKey = keyof Lenses;

export const get =
  <K extends LensKey>(key: K) =>
  (bl: Block) =>
    lenses[key].get(bl) as LensResult<Lenses[K]>;

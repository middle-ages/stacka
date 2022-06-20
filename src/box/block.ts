import { option as OP, function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/lib/Lens';
import { Lens } from 'monocle-ts/lib/Lens';
import { backdrop as BD } from 'src/backdrop';
import { block as BL, Block } from 'src/block';
import { MaybeColor } from 'src/color';
import * as GE from 'src/geometry';
import { Size } from 'src/geometry';
import { Cell, grid as GR, Style, Styled } from 'src/grid';
import { Endo, Unary } from 'util/function';
import { ModLens, modLens } from 'util/lens';
import * as TR from 'util/tree';
import { Pair, tuple3Map } from 'util/tuple';
import { Box, BoxGet, BoxMod } from './types';

export const block: ModLens<Box, Block> = TR.value<Block>();

export const measureGrid: BoxGet<GE.Size> = FN.flow(block.get, BL.measureGrid);

const toBlock = <T>(l: Lens<Block, T>): ModLens<Box, T> =>
  FN.pipe(block, LE.compose(l), modLens);

export const [grid, align, blend, backdrop, hAlign, vAlign, image, project] = [
  toBlock(BL.grid),
  toBlock(BL.align),
  toBlock(BL.blend),
  toBlock(BL.backdrop),
  toBlock(BL.hAlign),
  toBlock(BL.vAlign),
  toBlock(BL.image),
  toBlock(BL.project),
];

export const sizeFromBlock = block.mod(BL.resetSize),
  paintBlock = FN.flow(block.get, BL.paint),
  modGridMaybe: Unary<Unary<Cell, Cell[]>, Endo<Box>> = FN.flow(
    GR.modCells,
    grid.mod,
  ),
  modGridEmpty: Unary<Cell, Endo<Box>> = FN.flow(GR.modEmpty, grid.mod),
  modGridStyled: BoxMod<Styled> = FN.flow(GR.modStyled, grid.mod),
  modGridChar: BoxMod<string> = FN.flow(GR.modChar, grid.mod),
  modGridStyle: BoxMod<Style> = FN.flow(GR.modStyle, grid.mod);

export const [
  setFg,
  setBg,
  setFgOpacity,
  setBgOpacity,
  setColor,
  setStyle,

  setGridFg,
  setGridBg,
  setGridFgOpacity,
  setGridBgOpacity,
  setGridColor,
  setGridStyle,

  setSolidFg,
  setSolidBg,

  unsetFg,
  unsetBg,

  unsetColor,
  unsetGridFg,
  unsetGridBg,

  unsetGridColor,
] = [
  FN.flow(BL.setFg, block.mod),
  FN.flow(BL.setBg, block.mod),
  FN.flow(BL.setFgOpacity, block.mod),
  FN.flow(BL.setBgOpacity, block.mod),
  FN.flow(BL.setColor, block.mod),
  FN.flow(BL.setStyle, block.mod),

  FN.flow(BL.setGridFg, block.mod),
  FN.flow(BL.setGridBg, block.mod),
  FN.flow(BD.setGridFgOpacity, backdrop.mod),
  FN.flow(BD.setGridBgOpacity, backdrop.mod),
  FN.flow(BL.setGridColor, block.mod),
  FN.flow(BL.setGridStyle, block.mod),

  FN.flow(BL.setSolidFg, block.mod),
  FN.flow(BL.setSolidBg, block.mod),

  block.mod(BL.unsetFg),
  block.mod(BL.unsetBg),

  block.mod(BL.unsetColor),
  block.mod(BL.unsetGridFg),
  block.mod(BL.unsetGridBg),

  block.mod(BL.unsetGridColor),
];

export const measureImage: Unary<Box, Size> = FN.flow(
  image.get,
  GR.measureAligned,
);

export const [imageWidth, imageHeight]: Pair<Unary<Box, number>> = [
  FN.flow(measureImage, GE.size.width.get),
  FN.flow(measureImage, GE.size.height.get),
];

export const [blendNormal, blendOver, blendUnder] = FN.pipe(
  [BL.blendNormal, BL.blendOver, BL.blendUnder],
  tuple3Map(block.mod),
);

export const maybeSolidBg: Unary<MaybeColor, Endo<Box>> = OP.fold(
  () => FN.identity,
  setSolidBg,
);

export const incSize = block.mod(BL.incSize);

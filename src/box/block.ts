import { function as FN, option as OP } from 'fp-ts';
import { backdrop as BD } from 'src/backdrop';
import { block as BL, Block } from 'src/block';
import { MaybeColor } from 'src/color';
import * as LE from 'monocle-ts/Lens';
import * as GE from 'src/geometry';
import { Cell, grid as GR, Style, Styled } from 'src/grid';
import { Endo, Unary } from 'util/function';
import { modLens, ModLens } from 'util/lens';
import * as TR from 'util/tree';
import { Pair } from 'util/tuple';
import { Box, BoxGet, BoxMod } from './types';

export const block: ModLens<Box, Block> = TR.value<Block>();

/**
 * Measure the content grid of the box:
 *
 * 1. width = max row width
 * 2. height = number of rows
 */
export const measureGrid: BoxGet<GE.Size> = FN.flow(block.get, BL.measureGrid);

const toBlock = <T>(l: LE.Lens<Block, T>): ModLens<Box, T> =>
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
  modGridStyle: BoxMod<Style> = FN.flow(GR.modStyle, grid.mod),
  [
    setFgOpacity,
    setBgOpacity,
    setColor,
    setStyle,

    setGridFgOpacity,
    setGridBgOpacity,
    setGridColor,
    setGridStyle,
  ] = [
    FN.flow(BL.setFgOpacity, block.mod),
    FN.flow(BL.setBgOpacity, block.mod),
    FN.flow(BL.setColor, block.mod),
    FN.flow(BL.setStyle, block.mod),

    FN.flow(BD.setGridFgOpacity, backdrop.mod),
    FN.flow(BD.setGridBgOpacity, backdrop.mod),
    FN.flow(BL.setGridColor, block.mod),
    FN.flow(BL.setGridStyle, block.mod),
  ];

export const {
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
} = BL.delegateZero(block);

export const { setFg, setBg, setGridFg, setGridBg, setSolidFg, setSolidBg } =
  BL.delegateColor(block);

export const maybeSolidBg: Unary<MaybeColor, Endo<Box>> = OP.fold(
  () => FN.identity,
  setSolidBg,
);

// TODO border edge image or grid?
export const measureImage: Unary<Box, GE.Size> = FN.flow(
  image.get,
  GR.measureAligned,
);

export const [imageWidth, imageHeight]: Pair<Unary<Box, number>> = [
  FN.flow(measureImage, GE.size.width.get),
  FN.flow(measureImage, GE.size.height.get),
];

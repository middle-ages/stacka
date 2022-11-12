import { function as FN, readonlyArray as RA } from 'fp-ts';
import * as LE from 'monocle-ts/Lens';
import { block as BL, Block } from 'src/block';
import { Color } from 'src/color';
import * as CO from 'src/color';
import * as GE from 'src/geometry';
import { modLens, ModLens } from 'util/lens';
import * as TR from 'util/tree';
import { Box, BoxGet } from './types';

export const block: ModLens<Box, Block> = TR.value<Block>();

/**
 * Measure the content grid of the box:
 *
 * 1. width = max row width
 * 2. height = number of rows
 */
export const sizeFromBlock = block.mod(BL.resetSize),
  paintBlock = FN.flow(block.get, BL.paint),
  measureGrid: BoxGet<GE.Size> = FN.flow(block.get, BL.measureGrid);

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
  layoutGrid,
  blendNormal,
  blendScreen,
  blendOver,
  blendUnder,
  combineOver,
  combineUnder,
] = FN.pipe(BL.endomorphisms, RA.map(block.mod));

export const [setFg, setBg, addBg, colorBg, setGridFg, setGridBg] = FN.pipe(
  BL.colorSetters,
  RA.map(f => (color: Color) => block.mod(f(color))),
);

export const setStyle = FN.flow(BL.setStyle, block.mod),
  setGridStyle = FN.flow(BL.setGridStyle, block.mod);

export const [modFg, modBg] = [
  FN.flow(BL.modFg, block.mod),
  FN.flow(BL.modBg, block.mod),
];

export const fg = CO.delegateMods(modFg),
  bg = CO.delegateMods(modBg);

export const imageSize = FN.flow(block.get, BL.imageSize),
  [imageWidth, imageHeight] = [
    (b: Box) => imageSize(b).width,
    (b: Box) => imageSize(b).height,
  ];

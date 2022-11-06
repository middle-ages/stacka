import { array as AR, function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/lib/Lens';
import * as BL from 'src/block';
import * as GE from 'src/geometry';
import { Unary } from 'util/function';
import { ModLens, modLens } from 'util/lens';
import * as BLE from './block';
import { Box } from './types';

const block = BL.block;
const boxBlock = BLE.block;

const rect: ModLens<Box, GE.Rect> = FN.pipe(
  boxBlock,
  LE.compose(block.rect),
  modLens,
);

const maxWidth: Unary<Box[], number> = FN.flow(
  AR.map(boxBlock.get),
  block.maxWidth,
);

export const exportRect = {
  rect,

  ...block.delegateRect(rect),

  incZOrder: boxBlock.mod(block.incZOrder),
  decZOrder: boxBlock.mod(block.decZOrder),
  unsetZOrder: boxBlock.mod(block.unsetZOrder),

  corners: FN.flow(boxBlock.get, block.corners),
  hasSize: FN.flow(boxBlock.get, block.hasSize),
  area: FN.flow(boxBlock.get, block.area),

  translateToPositive: block.translateToPositiveFor(rect),
  minTopLeft: block.minTopLeft,
  incSize: boxBlock.mod(block.incSize),
  decSize: boxBlock.mod(block.incSize),

  maxWidth,
} as const;

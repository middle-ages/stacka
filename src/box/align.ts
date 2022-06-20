import { function as FN, readonlyArray as RA } from 'fp-ts';
import * as AL from 'src/align';
import { Endo } from 'util/function';
import * as BLE from './block';
import { exportRect as RCT } from './rect';
import { Box, BoxGet } from './types';
import { Rect, rect } from 'src/geometry';
import * as NO from './nodes';

export const [align, hAlign, vAlign] = [BLE.align, BLE.hAlign, BLE.vAlign];

/**
 * Match box vertical alignment. Runs one of the given functions, depending on
 * alignment.
 */
export const matchVAlign = <R>(top: R, middle: R, bottom: R): BoxGet<R> =>
  FN.flow(vAlign.get, AL.matchVAlign(top, middle, bottom));

export const [alignL, alignC, alignR] = FN.pipe(AL.hAlign, RA.map(hAlign.set)),
  [alignT, alignM, alignB] = FN.pipe(AL.vAlign, RA.map(vAlign.set));

export const center = FN.flow(alignC, alignM);

/**
 * Set box size to bounds of its own content and it child content
 *
 * This makes sure it is large enough to show both.
 */
export const sizeToContent: Endo<Box> = b => {
  const childBounds: Rect = FN.pipe(b, NO.measureNodes, rect.atOrigin),
    ownBounds = FN.pipe(b, BLE.measureGrid, rect.atOrigin),
    size = rect.add(childBounds, ownBounds).size;

  return FN.pipe(b, RCT.size.set(size));
};

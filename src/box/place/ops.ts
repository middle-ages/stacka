import { function as FN } from 'fp-ts';
import { curry2T, uncurry2 } from 'fp-ts-std/Function';
import * as AL from 'src/align';
import { Binary, BinaryC } from 'util/function';
import * as MV from '../move';
import { branch } from '../paint';
import { OpC } from '../types';

/** `moveAlignGap` that creates a curried binary operation */
export const placeBesides: BinaryC<AL.AlignPair, number, OpC> =
  alignPair => gap => anchor => placed =>
    FN.pipe([anchor, placed], MV.moveAlignGap(gap)(alignPair));

/** Uncurried version of `placeBesides` */
export const placeBesidesU: Binary<AL.AlignPair, number, OpC> = FN.pipe(
  placeBesides,
  uncurry2,
  FN.untupled,
);

/**
 * Create a curried binary operator that places boxes according to the given
 * `AlignPair` separated by the given gap.
 *
 * Like `placeBesides` except it creates a new parent and returns it instead of
 * the placed box. This new box will contain both the anchor and the placed box.
 *
 * For example to create an operator that layouts boxes horizontally, top
 * aligned, and with no gap:
 *
 * ```ts
 * const myOp = place(['right','top'])(0);
 * ```
 *
 * When `myOp` is called with an anchor box, and then with the box to be placed,
 * it will return a new box with the anchor and the placed box as its children,
 * where the placed box is zero columns to the right of the anchor, top aligned.
 */
export const place: typeof placeBesides = alignPair => gap => anchor =>
  FN.flow(
    FN.pipe(anchor, placeBesidesU(alignPair, gap)),
    FN.pipe(anchor, curry2T(branch)),
  );

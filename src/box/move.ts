import { function as FN, tuple as TU } from 'fp-ts';
import { flip, fork } from 'fp-ts-std/Function';
import { add } from 'fp-ts-std/Number';
import { Lens } from 'monocle-ts/lib/Lens';
import * as AL from 'src/align';
import { BinaryC, Unary } from 'util/function';
import { copyFromLensWith } from 'util/lens';
import { Pair } from 'util/tuple';
import { withFst } from 'fp-ts-std/Tuple';
import { exportRect as RCT } from './rect';
import { Box, OpT } from './types';

const getRectLenses: Unary<AL.OrientPair, Pair<Lens<Box, number>>> = ([
  anchor,
  placed,
]) => [RCT[anchor], RCT[placed]];

/**
 * Create a binary operator that move a box vs. an anchor and returns the
 * positioned box
 */
export const gapMove: BinaryC<number, AL.OrientPair, OpT> =
  givenGap => alignPair => boxPair => {
    const [isEdge, isHead] = FN.pipe(
      alignPair,
      fork([AL.align.isEdgePair, AL.align.isOrientHead]),
    );

    const gap =
      TU.fst(alignPair) === TU.snd(alignPair)
        ? givenGap
        : isHead
        ? -1 * (givenGap + 1)
        : isEdge
        ? givenGap + 1
        : givenGap;

    return FN.pipe(
      boxPair,
      FN.pipe(alignPair, getRectLenses, FN.pipe(gap, add, copyFromLensWith)),
    );
  };

/** Flipped `gapMove` takes the pair of alignments as first argument */
export const moveGap: BinaryC<AL.OrientPair, number, OpT> = flip(gapMove);

/** `gapMove` variant fixes gap between anchor and placed boxes at 0 */
export const move: Unary<AL.OrientPair, OpT> = gapMove(0);

/**
 * `gapMove` variant fixes the gap at zero, except for pairs with no
 * `middle` or `center` members. For these it is set to `-1` so that one row or
 * column is overlapping. For example: `moveSnug(['right','left'])` _will_ set
 * gap to `-1`, but `moveSnug(['middle','middle'])` or
 * `moveSnug(['left','center'])` will _not_.
 */
export const moveSnug: Unary<AL.OrientPair, OpT> = alignPair =>
  FN.pipe(alignPair, gapMove(AL.align.isEdgePair(alignPair) ? -1 : 0));

/**
 * `gapMove` variant that copies the position from anchor to placed box, from
 * and to the _same_ direction and with no gap.
 *
 * `alignWith('center')` for example, will X-axis center-align the placed box on
 * the anchor. This works because we get the value at the anchor lens named
 * `center`, and then set it on the placed lens of the same name.
 */
export const alignWith: Unary<AL.OrientAlign, OpT> = FN.flow(
  AL.align.dupAlign,
  move,
);

/**
 * `gapMove` twice on same anchor/placed pair: run a `moveGap` on the given
 * direction and its opposite, followed by an `alignWith`.
 */
export const moveAlignGap: BinaryC<number, AL.AlignPair, OpT> =
  gap =>
  ([givenDir, givenAlign]) =>
  boxPair =>
    FN.pipe(
      boxPair,
      FN.pipe(givenDir, AL.align.orientPair, gapMove(gap)),
      FN.pipe(boxPair, TU.fst, withFst),
      alignWith(givenAlign),
    );

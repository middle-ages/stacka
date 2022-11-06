import assert from 'assert';
import * as AL from '../align';
import { array as AR, function as FN } from 'fp-ts';
import { append, head, headTail, last } from 'util/array';
import { apply1, BinaryC, Unary } from 'util/function';
import { Pair, Tuple4 } from 'util/tuple';
import { withSnd } from 'fp-ts-std/Tuple';
import * as BU from './build';
import * as NO from './nodes';
import * as PA from './paint';
import * as PL from './place';
import { Box, Cat, OpC, OpT } from './types';
import { flip } from 'fp-ts-std/Function';

/**
 * Given a list of N boxes and a list of N-1 `Box => Box ⇒ Box` functions,
 * positions the boxes using the given functions and their predecessors in the
 * list as anchors, then adds them to the given parent.
 *
 * This converts a binary box operation into an N-ary, where a node's anchor is
 * its previous node in the given list.
 */
export const catOpsInto: BinaryC<Box, OpC[], Cat> =
  parent => placeOps => boxes => {
    const len = boxes.length;
    if (len === 0) return parent;
    else if (len === 1)
      return FN.pipe(
        parent,
        FN.pipe(boxes as Box[], head, NO.addNode),
        PA.sizeFromNodes,
      );

    assert(
      placeOps.length + 1 === len,
      `ops (${placeOps.length}) + 1 ≠ boxes (${len})`,
    );

    const ops = FN.pipe(
      placeOps,
      AR.map<OpC, OpT>(
        op =>
          ([anchor, placed]) =>
            FN.pipe(placed, op(anchor), NO.lastNode),
      ),
    );

    const [headAnchor, prePlaced] = headTail(boxes as Box[]);

    return !ops.length
      ? headAnchor
      : FN.pipe(
          prePlaced,
          AR.zip(ops),
          AR.reduce([headAnchor], (acc, [cur, op]) => {
            const x = FN.pipe(
              acc,
              last,
              withSnd<Box>(cur)<Box>,
              op,
              //AR.append(acc),
              append(acc),
            );
            return x;
          }),
          NO.addNodes,
          apply1(parent),
          PA.sizeFromNodes,
        );
  };

/** Like `catOpsInto` but create a new parent, which is returned */
export const catOps = catOpsInto(BU.empty);

/**
 * Like `catOpsInto` but takes only _one_ operator, which is replicated
 * `boxes.length - 1` times
 */
export const catOpInto: BinaryC<Box, OpC, Cat> = parent => op => boxes =>
  FN.pipe(boxes, catOpsInto(parent)(AR.replicate(boxes.length - 1, op)));

/** Like `catOpInto` but create a new parent, which is returned */
export const catOp = catOpInto(BU.empty);

export const [catAbove, catBelow, catLeftOf, catRightOf] = FN.pipe(
    [PL.above, PL.below, PL.leftOf, PL.rightOf],
    AR.map(catOp),
  ) as Tuple4<Cat>,
  [catAboveCenter, catBelowCenter, catLeftOfMiddle, catRightOfMiddle] = FN.pipe(
    [PL.aboveCenter, PL.belowCenter, PL.leftOfMiddle, PL.rightOfMiddle],
    AR.map(catOp),
  ) as Tuple4<Cat>,
  [catAboveRight, catBelowRight, catLeftOfTop, catRightOfTop] = FN.pipe(
    [PL.aboveRight, PL.belowRight, PL.leftOfTop, PL.rightOfTop],
    AR.map(catOp),
  ) as Tuple4<Cat>,
  [catSnugAbove, catSnugBelow, catSnugLeftOf, catSnugRightOf] = FN.pipe(
    [PL.snugAbove, PL.snugBelow, PL.snugLeftOf, PL.snugRightOf],
    AR.map(catOp),
  ) as Tuple4<Cat>,
  [
    catSnugAboveCenter,
    catSnugBelowCenter,
    catSnugLeftOfMiddle,
    catSnugRightOfMiddle,
  ] = FN.pipe(
    [
      PL.snugAboveCenter,
      PL.snugBelowCenter,
      PL.snugLeftOfMiddle,
      PL.snugRightOfMiddle,
    ],
    AR.map(catOp),
  ) as Tuple4<Cat>,
  [catSnugAboveRight, catSnugBelowRight, catSnugLeftOfTop, catSnugRightOfTop] =
    FN.pipe(
      [
        PL.snugAboveRight,
        PL.snugBelowRight,
        PL.snugLeftOfTop,
        PL.snugRightOfTop,
      ],
      AR.map(catOp),
    ) as Tuple4<Cat>;

export const [catAlignAboveGap, catAlignBelowGap]: Pair<
    BinaryC<AL.HAlign, number, Cat>
  > = [
    align => FN.flow(PL.alignAboveGap(align), catOp),
    align => FN.flow(PL.alignBelowGap(align), catOp),
  ],
  [catAlignLeftOfGap, catAlignRightOfGap]: Pair<
    BinaryC<AL.VAlign, number, Cat>
  > = [
    align => FN.flow(PL.alignLeftOfGap(align), catOp),
    align => FN.flow(PL.alignRightOfGap(align), catOp),
  ];

export const [catAlignAbove, catAlignBelow, catAlignLeftOf, catAlignRightOf] = [
    FN.pipe(0, flip(catAlignAboveGap)),
    FN.pipe(0, flip(catAlignBelowGap)),
    FN.pipe(0, flip(catAlignLeftOfGap)),
    FN.pipe(0, flip(catAlignRightOfGap)),
  ],
  [
    catSnugAlignAbove,
    catSnugAlignBelow,
    catSnugAlignLeftOf,
    catSnugAlignRightOf,
  ] = [
    FN.pipe(-1, flip(catAlignAboveGap)),
    FN.pipe(-1, flip(catAlignBelowGap)),
    FN.pipe(-1, flip(catAlignLeftOfGap)),
    FN.pipe(-1, flip(catAlignRightOfGap)),
  ],
  [catAboveGap, catBelowGap, catLeftOfGap, catRightOfGap]: Tuple4<
    Unary<number, Cat>
  > = [
    gap => FN.pipe(PL.aboveGap(gap), catOp),
    gap => FN.pipe(PL.belowGap(gap), catOp),
    gap => FN.pipe(PL.leftOfGap(gap), catOp),
    gap => FN.pipe(PL.rightOfGap(gap), catOp),
  ];

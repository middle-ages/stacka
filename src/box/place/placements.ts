import { function as FN, readonlyArray as RA } from 'fp-ts';
import { flip, fork } from 'fp-ts-std/Function';
import * as AL from 'src/align';
import * as GE from 'src/geometry';
import { BinaryC, Unary } from 'util/function';
import { Pair, Tuple3, Tuple4, TupleN } from 'util/tuple';
import { withFst } from 'fp-ts-std/Tuple';
import { place } from './ops';
import { OpC } from '../types';

/** Placement functions that let you select alignment and gap */
export const [alignAboveGap, alignBelowGap, alignLeftOfGap, alignRightOfGap]: [
  ...Pair<BinaryC<AL.HAlign, number, OpC>>,
  ...Pair<BinaryC<AL.VAlign, number, OpC>>,
] = [
  FN.flow(withFst('top' as GE.VDir), place),
  FN.flow(withFst('bottom' as GE.VDir), place),
  FN.flow(withFst('left' as GE.HDir), place),
  FN.flow(withFst('right' as GE.HDir), place),
];

const gapAlignDirs = [
  flip(alignAboveGap),
  flip(alignRightOfGap),
  flip(alignBelowGap),
  flip(alignLeftOfGap),
] as const;

export const [alignAbove, alignRightOf, alignBelow, alignLeftOf] = fork([
    ...gapAlignDirs,
  ])(0),
  [snugAlignAbove, snugAlignRightOf, snugAlignBelow, snugAlignLeftOf] = FN.pipe(
    -1,
    fork([...gapAlignDirs]),
  );

export const [
  [aboveGap, aboveCenterGap, aboveRightGap],
  [belowGap, belowCenterGap, belowRightGap],
  [leftOfTopGap, leftOfMiddleGap, leftOfGap],
  [rightOfTopGap, rightOfMiddleGap, rightOfGap],
] = [
  ...FN.pipe(AL.hAlign, fork([RA.map(alignAboveGap), RA.map(alignBelowGap)])),
  ...FN.pipe(
    AL.vAlign,
    fork([RA.map(alignLeftOfGap), RA.map(alignRightOfGap)]),
  ),
] as Tuple4<Tuple3<Unary<number, OpC>>>;

const [expandAbove, expandBelow, expandLeft, expandRight] = [
    [aboveGap, aboveCenterGap, aboveRightGap],
    [belowGap, belowCenterGap, belowRightGap],
    [leftOfTopGap, leftOfMiddleGap, leftOfGap],
    [rightOfTopGap, rightOfMiddleGap, rightOfGap],
  ] as const,
  [vExpand, hExpand] = [
    [...expandAbove, ...expandBelow],
    [...expandLeft, ...expandRight],
  ] as const;

export const [
    above,
    aboveCenter,
    aboveRight,
    below,
    belowCenter,
    belowRight,
  ]: TupleN<OpC, 6> = FN.pipe(0, fork([...vExpand])),
  [
    snugAbove,
    snugAboveCenter,
    snugAboveRight,
    snugBelow,
    snugBelowCenter,
    snugBelowRight,
  ]: TupleN<OpC, 6> = FN.pipe(-1, fork([...vExpand]));

export const [
    leftOfTop,
    leftOfMiddle,
    leftOf,
    rightOfTop,
    rightOfMiddle,
    rightOf,
  ]: TupleN<OpC, 6> = FN.pipe(0, fork([...hExpand])),
  [
    snugLeftOfTop,
    snugLeftOfMiddle,
    snugLeftOf,
    snugRightOfTop,
    snugRightOfMiddle,
    snugRightOf,
  ]: TupleN<OpC, 6> = FN.pipe(-1, fork([...hExpand]));

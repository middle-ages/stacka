/** All nullary placement combinators */
const basicNames = [
  'above',
  'below',
  'leftOf',
  'rightOf',

  'snugAbove',
  'snugBelow',
  'snugLeftOf',
  'snugRightOf',

  'aboveCenter',
  'aboveRight',
  'belowCenter',
  'belowRight',

  'leftOfTop',
  'leftOfMiddle',
  'rightOfTop',
  'rightOfMiddle',

  'snugAboveCenter',
  'snugAboveRight',
  'snugBelowCenter',
  'snugBelowRight',

  'snugLeftOfTop',
  'snugLeftOfMiddle',
  'snugRightOfTop',
  'snugRightOfMiddle',
] as const;

/** All 0-arg placement combinators that accept a horizontal alignment */
const hAlignNames = [
  'alignAbove',
  'alignBelow',
  'snugAlignAbove',
  'snugAlignBelow',
] as const;

/** All 1-arg placement combinators that accept a vertical alignment */
const vAlignNames = [
  'alignRightOf',
  'alignLeftOf',
  'snugAlignRightOf',
  'snugAlignLeftOf',
] as const;

/** All 1-arg placement combinators that accept a numeric gap parameter */
const gapNames = [
  'aboveGap',
  'belowGap',
  'leftOfGap',
  'rightOfGap',
  'aboveCenterGap',
  'aboveRightGap',
  'belowCenterGap',
  'belowRightGap',
  'leftOfTopGap',
  'leftOfMiddleGap',
  'rightOfTopGap',
  'rightOfMiddleGap',
] as const;

/** All placements combinator that accept a horizontal alignment and a gap */
const hAlignGapNames = ['alignAboveGap', 'alignBelowGap'] as const;

/** All placements combinator that accept a vertical alignment and a gap */
const vAlignGapNames = ['alignLeftOfGap', 'alignRightOfGap'] as const;

export const placements = {
  basicNames,
  gapNames,
  hAlignNames,
  vAlignNames,
  hAlignGapNames,
  vAlignGapNames,
};

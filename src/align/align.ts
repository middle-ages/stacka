import { predicate as PRE } from 'fp-ts';
import { dup, toSnd } from 'fp-ts-std/Tuple';
import { dir } from 'src/geometry';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { exportInstances as IN } from './instances';
import { hLens, vLens } from './lens';
import {
  alignments,
  AlignPair,
  DupAlign,
  HAlign,
  hAlign,
  HAlignPair,
  OrientAlign,
  OrientPair,
  VAlign,
  vAlign,
  VAlignPair,
} from './types';

export * from './types';

const isHorizontal = (a: OrientAlign): a is HAlign =>
    (hAlign as readonly string[]).includes(a as string),
  isVertical = (a: OrientAlign): a is VAlign =>
    (vAlign as readonly string[]).includes(a as string);

const isHVPair = (a: AlignPair): a is HAlignPair => isHorizontal(a[0]),
  isVHPair = (a: AlignPair): a is VAlignPair => isVertical(a[0]);

const reversedHorizontal: Unary<HAlign, Pair<HAlign>> = toSnd(a =>
    a === 'center' ? a : dir.reversed(a),
  ),
  reversedVertical: Unary<VAlign, Pair<VAlign>> = toSnd(a =>
    a === 'middle' ? a : dir.reversed(a),
  ),
  /**
   * Given the `center` or `middle` alignments in `a`, returns `[a,a]`.
   * If `a` is an edge direction, returns `[a, reversed(a)]`.
   *
   * Example: `orientPair('bottom')` returns `['bottom', 'top']`, but
   * `orientPair('middle')` returns `['middle', 'middle']`.
   */
  orientPair = <A extends OrientAlign>(a: A) =>
    [
      a,
      isHorizontal(a)
        ? a === 'center'
          ? a
          : dir.reversed(a)
        : isVertical(a)
        ? a === 'middle'
          ? a
          : dir.reversed(a)
        : a,
    ] as DupAlign<A>;

const dupAlign = <A extends OrientAlign>(a: A) => dup(a) as DupAlign<A>;

/**
 * Given a pair of alignments on same orientation, if you drew a directed line
 * from the first to the second, does it point at the positive axis direction?
 *
 * For example, `['left','right']` has the directed line `from left → to right`,
 * pointing right, and because this is the positive X-axis direction, we get
 * `true`.
 *
 * On the other hand `['bottom','top']` has the directed line pointing up, from
 * bottom to top, which is negative Y-axis direction, and we get `false`.
 *
 * Only true for `['left', 'right']` and `['top', 'bottom']`.
 */
const isOrientHead: PRE.Predicate<OrientPair> = ([fst, snd]) =>
  isHorizontal(fst)
    ? fst === 'left' && snd === 'right'
    : fst === 'top' && snd === 'bottom';

/** Are there no `center` or `middle` alignments in this pair? */
const isEdgePair: PRE.Predicate<OrientPair> = ([fst, snd]) =>
  isHorizontal(fst)
    ? fst !== 'center' && snd !== 'center'
    : fst !== 'middle' && snd !== 'middle';

export const align = {
  hLens,
  vLens,
  ...IN,
  ...alignments,

  isHorizontal,
  isVertical,
  isHVPair,
  isVHPair,
  reversedHorizontal,
  reversedVertical,
  isOrientHead,
  isEdgePair,
  dupAlign,
  orientPair,
} as const;

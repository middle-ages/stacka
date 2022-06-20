import { function as FN } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { chopCharLeft } from 'src/grid/cell/ops';
import { Binary, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { chopAtLeastLeft } from './chopAtLeast';
import { Row } from './types';

/*
 * Given two equal-width rows splits each into two. The left parts will be
 * equal-width and the split will be done at the left-most position where this
 * is possible.
 *
 * ## Preconditions
 *
 * Two given rows are equal-width
 *
 * ## Returns
 *
 * The two rows, each split into two parts. Left parts of each split will be of
 * equal width. Will not break wide character cell spans.
 *
 */

const computeDelta: Binary<Row, Row, number> = (fstDone, sndDone) =>
  fstDone.length - sndDone.length;

export const chopMinLeft: Unary<Pair<Row>, Pair<Pair<Row>>> = ([fst, snd]) => {
  if (fst.length === 0)
    return [
      [[], []],
      [[], []],
    ];

  const [fstInit, sndInit] = FN.pipe([fst, snd], mapBoth(chopCharLeft));

  const [fstDone, sndDone] = [fstInit[0], sndInit[0]];

  let [fstTodo, sndTodo] = [fstInit[1], sndInit[1]];

  let delta = computeDelta(fstDone, sndDone);

  while (delta !== 0) {
    if (delta > 0) {
      const { left, right } = chopAtLeastLeft(delta)(sndTodo);
      sndTodo = right;
      sndDone.push(...left);
    } else {
      const { left, right } = chopAtLeastLeft(-1 * delta)(fstTodo);
      fstTodo = right;
      fstDone.push(...left);
    }
    delta = computeDelta(fstDone, sndDone);
  }

  return [
    [fstDone, fstTodo],
    [sndDone, sndTodo],
  ];
};

import { function as FN, show as SH } from 'fp-ts';
import { Unary } from 'util/function';
import { Pair, pairMap } from 'util/tuple';
import { horizontal, Horizontal, Vertical, vertical } from './dir';

export const orientations = ['horizontal', 'vertical'] as const;

export type Orientations = typeof orientations;
export type Orientation = Orientations[number];

export const mapOrientations = <R>(f: Unary<Orientation, R>) =>
  FN.pipe([...orientations], pairMap(f));

export const matchOrient =
  <R>(h: R, v: R): Unary<Orientation, R> =>
  o =>
    o === 'vertical' ? v : h;

export const mapOrientDirs = <R>(
  f: Unary<Horizontal | Vertical, R>,
): Pair<R> => [f(horizontal), f(vertical)];

export const flipOrientMap = {
  horizontal: 'vertical',
  vertical: 'horizontal',
} as const;

export type FlipOrient = typeof flipOrientMap;

export const reverseOrient = <O extends Orientation>(o: O): FlipOrient[O] =>
  flipOrientMap[o];

export const showOrient: SH.Show<Orientation> = { show: matchOrient('↕', '↔') };

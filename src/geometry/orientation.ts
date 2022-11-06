import { picksT } from 'util/object';
import { Pair } from 'util/tuple';

export type Orientation = 'horizontal' | 'vertical';
export type Oriented<T> = Record<Orientation, T>;
export type Orient = Oriented<string>;

export const orientations: Pair<Orientation> = ['horizontal', 'vertical'];

/**
 * Filter out all entries except those keyed by `horizontal` or `vertical`
 */
export const pickOrientations =
  <T>() =>
  <D extends Oriented<T>>(d: D): Oriented<T> =>
    picksT(orientations)(d);

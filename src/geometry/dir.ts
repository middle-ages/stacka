import {
  array as AR,
  function as FN,
  readonlyArray as RA,
  show as SH,
} from 'fp-ts';
import { dup } from 'fp-ts-std/Tuple';
import { Orient, Orientation, Oriented } from './orientation';
import { picksT } from 'util/object';
import { Unary } from 'util/function';
import { Pair, Tuple4 } from 'util/tuple';

export const horizontal = ['left', 'right'] as const,
  vertical = ['top', 'bottom'] as const,
  all = ['top', 'right', 'bottom', 'left'] as const,
  orientDirMap = { horizontal, vertical } as const;

export type OrientDirs<O extends Orientation> = O extends 'horizontal'
  ? ['left', 'right']
  : O extends 'vertical'
  ? ['top', 'bottom']
  : never;

export const orientDirs = <O extends Orientation>(o: O) =>
  orientDirMap[o] as typeof orientDirMap[O] & OrientDirs<O>;

export type Dirs = typeof all;
export type Dir = Dirs[number];
export type Directed<T> = Record<Dir, T>;
export type Direct = Directed<string>;

export type Horizontal = typeof horizontal;
export type HDir = Horizontal[number];
export type Vertical = typeof vertical;
export type VDir = Vertical[number];

export const isDirect = (c: Orient | Direct): c is Direct => 'top' in c;

/**
 * Filter out all entries except those keyed by `top`, `right`, `bottom`, or
 * `left`
 */
export const pickDirs =
  <T>() =>
  <D extends Directed<T>>(d: D): Directed<T> =>
    picksT(all)(d);

/**
 * Convert an object of type `{horizontal: T, vertical: T}` to an object of
 * type: `{top: T, right: T, bottom: T, left: T}`. Horizontal values go to
 * the horizontal directions left & right and vertical to the vertical
 * directions top & bottom.
 */
export const fromOriented =
  <T>() =>
  <O extends Oriented<T>>({ horizontal, vertical }: O): Directed<T> => ({
    top: horizontal,
    right: vertical,
    bottom: horizontal,
    left: vertical,
  });

/** Flip the horizontal entries left ⇒ right & right ⇒ left */
export const hFlip =
    <T>() =>
    <D extends Directed<T>>({ right, left, ...rest }: D): Directed<T> => ({
      right: left,
      left: right,
      ...rest,
    }),
  /** Flip the vertical entries top ⇒ bottom & bottom ⇒ top */
  vFlip =
    <T>() =>
    <D extends Directed<T>>({ top, bottom, ...rest }: D): Directed<T> => ({
      top: bottom,
      bottom: top,
      ...rest,
    }),
  /** Flip horizontal and vertical entries: top ↔ bottom and left ↔ right */
  flip =
    <T>() =>
    <D extends Directed<T>>(d: D): Directed<T> =>
      FN.pipe(d, hFlip<T>(), vFlip<T>());

const reversedDirMap = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
} as const;

export type ReversedDir = typeof reversedDirMap;

const snugDirMap: Record<Dir, Readonly<Pair<Dir>>> = {
  top: horizontal,
  right: vertical,
  bottom: horizontal,
  left: vertical,
};

/** The snug dirs of a direction are the two adjacent directions */
export const snug: Unary<Dir, Pair<Dir>> = dir => snugDirMap[dir] as Pair<Dir>;

export const singleton = <T>(t: T): Directed<T> => ({
    top: t,
    right: t,
    bottom: t,
    left: t,
  }),
  check = (d: string): d is Dir => d in dirSym,
  [withHDirs, withVDirs] = [
    <T>([left, right]: Pair<T>): Record<HDir, T> => ({ left, right }),
    <T>([top, bottom]: Pair<T>): Record<VDir, T> => ({ top, bottom }),
  ],
  dirSym = {
    top: '↑',
    right: '→',
    bottom: '↓',
    left: '←',
  } as const,
  value = FN.pipe(all, RA.map(dup), Object.fromEntries) as {
    [K in Dir]: K;
  };

export const [map, zip] = [
    <R>(f: Unary<Dir, R>) => FN.pipe([...all], AR.map(f)) as Tuple4<R>,
    <R>(r: Tuple4<R>) => FN.pipe([...all], AR.zip(r)) as Tuple4<[Dir, R]>,
  ],
  [mapH, mapV] = [
    <R>(f: Unary<'left' | 'right', R>) =>
      FN.pipe([...horizontal], AR.map(f)) as Pair<R>,
    <R>(f: Unary<'top' | 'bottom', R>) =>
      FN.pipe([...vertical], AR.map(f)) as Pair<R>,
  ],
  reversed = <D extends Dir>(d: D): ReversedDir[D] => reversedDirMap[d],
  pairReversed = <D extends Dir>(d: D) =>
    [d, reversed(d)] as [D, ReversedDir[D]];

export const match =
  <R>(top: R, right: R, bottom: R, left: R): Unary<Dir, R> =>
  dir =>
    dir === 'top'
      ? top
      : dir === 'right'
      ? right
      : dir === 'bottom'
      ? bottom
      : left;

export const show: SH.Show<Dir> = { show: dir => dirSym[dir] };

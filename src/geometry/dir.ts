import {
  array as AR,
  function as FN,
  readonlyArray as RA,
  show as SH,
} from 'fp-ts';
import { dup } from 'fp-ts-std/Tuple';
import { Unary } from 'util/function';
import { Pair, Tuple4 } from 'util/tuple';
import { Orientation } from 'src/geometry';

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

export type Horizontal = typeof horizontal;
export type HDir = Horizontal[number];
export type Vertical = typeof vertical;
export type VDir = Vertical[number];

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

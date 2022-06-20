import { array as AR, function as FN, show as SH } from 'fp-ts';
import { Unary } from 'util/function';
import { Pair, Tuple4 } from 'util/tuple';

export const horizontal = ['left', 'right'] as const,
  vertical = ['top', 'bottom'] as const,
  dirs = ['top', 'right', 'bottom', 'left'] as const,
  capDirs = ['Top', 'Right', 'Bottom', 'Left'] as const;

export type Dirs = typeof dirs;
export type Dir = Dirs[number] & string;

export type CapDirs = typeof capDirs;
export type CapDir = CapDirs[number];

export type Horizontal = typeof horizontal;
export type HDir = Horizontal[number] & string;
export type Vertical = typeof vertical;
export type VDir = Vertical[number] & string;

export const dirSym = {
  top: '↑',
  right: '→',
  bottom: '↓',
  left: '←',
} as const;

export const isDir = (d: string): d is Dir => d in dirSym;

export const [mapDirs, zipDirs] = [
  <R>(f: Unary<Dir, R>) => FN.pipe([...dirs], AR.map(f)) as Tuple4<R>,
  <R>(r: Tuple4<R>) => FN.pipe([...dirs], AR.zip(r)) as Tuple4<[Dir, R]>,
];

export const [mapHDirs, mapVDirs] = [
  <R>(f: Unary<'left' | 'right', R>) =>
    FN.pipe([...horizontal], AR.map(f)) as Pair<R>,
  <R>(f: Unary<'top' | 'bottom', R>) =>
    FN.pipe([...vertical], AR.map(f)) as Pair<R>,
];

export const matchDir =
  <R>(top: R, right: R, bottom: R, left: R): Unary<Dir, R> =>
  dir =>
    dir === 'top'
      ? top
      : dir === 'right'
      ? right
      : dir === 'bottom'
      ? bottom
      : left;

const reverseDirMap = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
} as const;

export type ReverseDir = typeof reverseDirMap;

export const reverseDir = <D extends Dir>(d: D): ReverseDir[D] =>
    reverseDirMap[d],
  pairReverse = <D extends Dir>(d: D) =>
    [d, reverseDir(d)] as [D, ReverseDir[D]];

const snugDirMap: Record<Dir, Readonly<Pair<Dir>>> = {
  top: horizontal,
  right: vertical,
  bottom: horizontal,
  left: vertical,
};

/** The snug dirs of a direction are the two adjacent directions */
export const snugDirs: Unary<Dir, Pair<Dir>> = dir =>
  snugDirMap[dir] as Pair<Dir>;

export const showDir: SH.Show<Dir> = { show: dir => dirSym[dir] };

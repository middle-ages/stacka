import { function as FN, readonlyArray as RA, show as SH } from 'fp-ts';
import { dup } from 'fp-ts-std/Tuple';
import { mapValues } from 'util/object';
import { Endo, Unary } from 'util/function';
import { Pair, Tuple3, TupleN } from 'util/tuple';
import { Corner, show as showCorner } from './corner';
import {
  check as checkDir,
  Dir,
  match as matchDir,
  show as showDir,
  snug as snugDir,
} from './dir';

const all = [
  'topLeft',
  'top',
  'topRight',
  'right',
  'bottomRight',
  'bottom',
  'bottomLeft',
  'left',
] as const;

export type BorderDirs = typeof all;
export type BorderDir = BorderDirs[number];
export type Bordered<T> = Record<BorderDir, T>;

export const value = FN.pipe(all, RA.map(dup), Object.fromEntries) as {
  [K in BorderDir]: K;
};

export const singleton = <A>(a: A) =>
    FN.pipe(a, FN.constant, mapValues<BorderDir, A>),
  sym: Unary<BorderDir, string> = bd =>
    checkDir(bd) ? showDir.show(bd) : showCorner.show(bd);

export const map = <R>(f: Unary<BorderDir, R>) =>
    FN.pipe(all, RA.map(f)) as TupleN<R, 8> & R[],
  modAt =
    <A>(f: Endo<A>): Unary<BorderDir, Endo<Bordered<A>>> =>
    dir =>
    direct => ({ ...direct, [dir]: f(direct[dir]) }),
  associate = <R>(f: Unary<BorderDir, R>): Bordered<R> =>
    FN.pipe(value, mapValues(f));

export const [isHorizontal, isVertical] = [
    (o: BorderDir): o is 'left' | 'right' => o === 'left' || o === 'right',
    (o: BorderDir): o is 'top' | 'bottom' => o === 'top' || o === 'bottom',
  ],
  [isTopEdge, isBottomEdge, isLeftEdge, isRightEdge] = [
    (o: BorderDir): o is 'topLeft' | 'top' | 'topRight' => o.startsWith('top'),
    (o: BorderDir): o is 'bottomLeft' | 'bottom' | 'bottomRight' =>
      o.startsWith('bottom'),
    (o: BorderDir): o is 'topLeft' | 'left' | 'bottomLeft' =>
      o === 'left' || o.endsWith('Left'),
    (o: BorderDir): o is 'topRight' | 'right' | 'bottomRight' =>
      o === 'right' || o.endsWith('Right'),
  ];

/**  What are the 3 border dirs required to show a border at a direction? */
export const snugBorderDirs: Unary<Dir, Tuple3<BorderDir>> = matchDir(
  ['topLeft', 'top', 'topRight'],
  ['topRight', 'right', 'bottomRight'],
  ['bottomLeft', 'bottom', 'bottomRight'],
  ['topLeft', 'left', 'bottomLeft'],
);

/** What is the corner pair that hugs this direction? */
export const snugCorners: Unary<Dir, Pair<Corner>> = dir => {
  const [pre, , post] = snugBorderDirs(dir);
  return [pre, post] as Pair<Corner>;
};

/** What is the corner pair + snug dir pair that hug this direction?
 *
 * This is same as `dir + dir.snug(dir) + snugCorners(dir)`.
 */
export const snug = (d: Dir) => {
  const [preCorner, postCorner] = snugCorners(d),
    [pre, post] = snugDir(d);

  return [pre, preCorner, d, postCorner, post] as TupleN<BorderDir, 5>;
};

export const show: SH.Show<BorderDir> = { show: sym };

import { function as FN, readonlyArray as RA, show as SH } from 'fp-ts';
import { dup } from 'fp-ts-std/Tuple';
import { Endo, Unary } from 'util/function';
import { Pair, Tuple3, TupleN } from 'util/tuple';
import * as corner from './corner';
import { Corner } from './corner';
import * as dir from './dir';
import { Dir } from './dir';

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

export const singleton = <T>(t: T): Bordered<T> => ({
    ...dir.singleton(t),
    ...corner.singleton(t),
  }),
  sym: Unary<BorderDir, string> = bd =>
    dir.check(bd) ? dir.show.show(bd) : corner.show.show(bd);

export const map = <R>(f: Unary<BorderDir, R>) =>
    FN.pipe(all, RA.map(f)) as TupleN<R, 8> & R[],
  modAt =
    <A>(f: Endo<A>): Unary<BorderDir, Endo<Bordered<A>>> =>
    dir =>
    direct => ({ ...direct, [dir]: f(direct[dir]) });

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
export const snugBorderDirs: Unary<Dir, Tuple3<BorderDir>> = dir.match(
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
    [pre, post] = dir.snug(d);

  return [pre, preCorner, d, postCorner, post] as TupleN<BorderDir, 5>;
};

export const show: SH.Show<BorderDir> = { show: sym };

import {
  array as AR,
  eq as EQ,
  function as FN,
  monoid as MO,
  number as NU,
  ord as OD,
  predicate as PRE,
  show as SH,
} from 'fp-ts';
import { curry2, fork } from 'fp-ts-std/Function';
import { add as plus, subtract } from 'fp-ts-std/Number';
import { dup, mapBoth, withFst, withSnd } from 'fp-ts-std/Tuple';
import * as LE from 'monocle-ts/lib/Lens';
import { maxPositiveMonoid } from 'util/fp-ts';
import { Binary, BinOp, BinOpC, BinOpT, Endo, Unary } from 'util/function';
import { modLens } from 'util/lens';
import { objectMono, typedValues } from 'util/object';
import { Pair, pairFlow } from 'util/tuple';

export const sizeKeys = ['width', 'height'] as const;

export type SizeKey = typeof sizeKeys[number];
export type Size = Record<SizeKey, number>;

//#region build
export const build: Binary<number, number, Size> = (width, height) => ({
    width,
    height,
  }),
  tupled = FN.tupled(build),
  fromWidth: Unary<number, Size> = FN.flow(withSnd(0), tupled),
  fromHeight: Unary<number, Size> = FN.flow(withFst(0), tupled),
  square: Unary<number, Size> = FN.flow(dup, tupled),
  [empty, unitSquare] = FN.pipe([0, 1], mapBoth(square));
//#endregion

//#region query
const lens = (k: SizeKey) => FN.pipe(LE.id<Size>(), LE.prop(k), modLens);

export const pair: Unary<Size, Pair<number>> = typedValues,
  width = lens('width'),
  height = lens('height'),
  area: Unary<Size, number> = ({ width, height }) => width * height,
  hasArea: PRE.Predicate<Size> = ({ width, height }) =>
    width !== 0 || height !== 0,
  isEmpty: PRE.Predicate<Size> = ({ width, height }) =>
    width === 0 && height === 0;
//#endregion

//#region modify
export const [addWidth, addHeight] = [
    FN.flow(plus, width.mod),
    FN.flow(plus, height.mod),
  ],
  [subWidth, subHeight] = [
    FN.flow(subtract, width.mod),
    FN.flow(subtract, height.mod),
  ],
  [add, sub]: Pair<BinOp<Size>> = [
    (fst, { width, height }) =>
      FN.pipe(fst, addWidth(width), addHeight(height)),
    (fst, { width, height }) =>
      FN.pipe(fst, subWidth(width), subHeight(height)),
  ],
  [subT, subC] = [FN.tupled(sub), curry2(sub)],
  [addT, addC]: [BinOpT<Size>, BinOpC<Size>] = [FN.tupled(add), curry2(add)],
  inc: Endo<Size> = FN.pipe([1, 1], tupled, addC),
  [halfWidth, halfHeight] = [
    width.mod(n => Math.floor(n / 2)),
    height.mod(n => Math.floor(n / 2)),
  ],
  half: Endo<Size> = FN.flow(halfWidth, halfHeight),
  scaleH: Unary<number, Endo<Size>> =
    n =>
    ({ width, height }) => ({ width: width * n, height }),
  scaleV: Unary<number, Endo<Size>> =
    n =>
    ({ width, height }) => ({ width, height: height * n }),
  scale: Unary<number, Endo<Size>> = FN.flow(fork([scaleH, scaleV]), pairFlow),
  abs: Endo<Size> = ({ width, height }) => ({
    width: Math.abs(width),
    height: Math.abs(height),
  });
//#endregion

//#region instances

export const getMonoid: Unary<MO.Monoid<number>, MO.Monoid<Size>> = (
    monoid: MO.Monoid<number>,
  ) => FN.pipe(monoid, objectMono(sizeKeys), MO.struct),
  monoid: Record<'sum' | 'max', MO.Monoid<Size>> = {
    max: getMonoid(maxPositiveMonoid), // size≥0
    sum: getMonoid(NU.MonoidSum),
  },
  ord: Record<SizeKey, OD.Ord<Size>> = {
    width: FN.pipe(NU.Ord, OD.contramap(width.get)),
    height: FN.pipe(NU.Ord, OD.contramap(height.get)),
  },
  eq: EQ.Eq<Size> = {
    equals: (fst, snd) =>
      ord.width.equals(fst, snd) && ord.height.equals(fst, snd),
  },
  show: SH.Show<Size> = { show: ({ width, height }) => `↔${width}:↕${height}` };
//#endregion

//#region operations
export const fill =
  <T>(t: T): Unary<Size, T[][]> =>
  s =>
    AR.replicate(height.get(s), AR.replicate(width.get(s), t));

export const fitsInside: Unary<Size, PRE.Predicate<Size>> =
  ({ width: parentWidth, height: parentHeight }) =>
  ({ width: childWidth, height: childHeight }) =>
    parentWidth >= childWidth && parentHeight >= childHeight;
//#endregion

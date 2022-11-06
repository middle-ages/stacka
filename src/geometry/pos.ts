import * as fc from 'fast-check';
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
import { curry2 } from 'fp-ts-std/Function';
import { add as plus, subtract } from 'fp-ts-std/Number';
import { mapBoth, withFst, withSnd } from 'fp-ts-std/Tuple';
import * as LE from 'monocle-ts/lib/Lens';
import { Binary, BinOp, BinOpC, BinOpT, Endo, Unary } from 'util/function';
import { modLens } from 'util/lens';
import { typedValues } from 'util/object';
import { Pair, pairCartesian } from 'util/tuple';
import { build as buildSize, inc as incSize, Size } from './size';

export const keys = ['top', 'left'] as const;

export type PosKey = typeof keys[number];
export type Pos = Record<PosKey, number>;

//#region build
export const build: Binary<number, number, Pos> = (top, left) => ({
    top,
    left,
  }),
  tupled = FN.tupled(build),
  fromTop: Unary<number, Pos> = FN.flow(withSnd(0), tupled),
  fromLeft: Unary<number, Pos> = FN.flow(withFst(0), tupled),
  [unit, origin] = [build(1, 1), build(0, 0)];
//#endregion

//#region query
const lens = LE.id<Pos>();

export const top = FN.pipe(lens, LE.prop('top'), modLens),
  left = FN.pipe(lens, LE.prop('left'), modLens);

export const pair: Unary<Pos, Pair<number>> = typedValues,
  sizeFromOrigin: Unary<Pos, Size> = ({ top, left }) =>
    buildSize(left + 1, top + 1),
  bottomRight: Unary<Size, Pos> = ({ width, height }) =>
    build(height - 1, width - 1);
//#endregion

//#region instances
const maxPosNat = fc.nat(100);

export const getMonoid: Unary<MO.Monoid<number>, MO.Monoid<Pos>> = (
  monoid: MO.Monoid<number>,
) => MO.struct({ top: monoid, left: monoid });

export const monoid: Record<'sum' | 'max', MO.Monoid<Pos>> = {
  max: FN.pipe(NU.Bounded, MO.max, getMonoid),
  sum: getMonoid(NU.MonoidSum),
};

export const ord: Record<PosKey, OD.Ord<Pos>> = {
    top: FN.pipe(NU.Ord, OD.contramap(top.get)),
    left: FN.pipe(NU.Ord, OD.contramap(left.get)),
  },
  eq: EQ.Eq<Pos> = {
    equals: (fst, snd) => ord.top.equals(fst, snd) && ord.left.equals(fst, snd),
  },
  show: SH.Show<Pos> = {
    show: ({ top, left }) => `▲${top}:◀${left}`,
  },
  arb: fc.Arbitrary<Pos> = fc.record({ top: maxPosNat, left: maxPosNat });
//#endregion

//#region modify
export const [addTop, addLeft] = [
    FN.flow(plus, top.mod),
    FN.flow(plus, left.mod),
  ],
  [subTop, subLeft] = [FN.flow(subtract, top.mod), FN.flow(subtract, left.mod)],
  [add, sub]: Pair<BinOp<Pos>> = [
    monoid.sum.concat,
    (fst, { top, left }) => FN.pipe(fst, subTop(top), subLeft(left)),
  ],
  [subT, subC] = [FN.tupled(sub), curry2(sub)],
  [addT, addC]: [BinOpT<Pos>, BinOpC<Pos>] = [FN.tupled(add), curry2(add)],
  [addSize, subSize]: Pair<Unary<Size, Endo<Pos>>> = [
    FN.flow(bottomRight, addC),
    FN.flow(incSize, bottomRight, subC),
  ],
  [inc, dec]: Pair<Endo<Pos>> = [addC(unit), subC(unit)];
//#endregion

//#region query
export const isOrigin: PRE.Predicate<Pos> = FN.pipe(origin, curry2(eq.equals)),
  [minTop, minLeft, maxTop, maxLeft] = FN.pipe(
    [
      [ord.top, ord.left],
      [OD.min, OD.max],
    ] as const,
    pairCartesian,
    AR.map(
      ([order, cmp]): Unary<Pos[], Pos> =>
        ps =>
          ps.slice(1, ps.length).reduce(cmp(order), ps[0]),
    ),
  ),
  min = (ps: Pos[]) => build(minTop(ps).top, minLeft(ps).left),
  max = (ps: Pos[]) => build(maxTop(ps).top, maxLeft(ps).left),
  rectSize: Unary<Pair<Pos>, Size> = ([tl, br]: Pair<Pos>) => {
    const { top, left } = sub(br, tl);
    return buildSize(Math.abs(left) + 1, Math.abs(top) + 1);
  };

/**
 * Convert a  set of positions so that all coordinates are positive while keeping
 * the same distances between the positions.
 *
 * Origin is at top left and axes go right and down.
 */
export const translateToPositive: Endo<Pos[]> = ps => {
  const computeDelta: Endo<number> = coord => (coord >= 0 ? 0 : -1 * coord),
    topLeft = min(ps),
    delta = FN.pipe(topLeft, pair, mapBoth(computeDelta), tupled);

  return FN.pipe(ps, FN.pipe(delta, addC, AR.map));
};
//#endregion

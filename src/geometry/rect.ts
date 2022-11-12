import {
  array as AR,
  eq as EQ,
  function as FN,
  monoid as MO,
  predicate as PRE,
  show as SH,
  tuple as TU,
} from 'fp-ts';
import { curry2, fork } from 'fp-ts-std/Function';
import { decrement } from 'fp-ts-std/Number';
import { increment } from 'fp-ts/lib/function';
import * as LE from 'monocle-ts/lib/Lens';
import {
  Binary,
  BinOp,
  BinOpC,
  BinOpT,
  Endo,
  Unary,
  uncurry2T,
} from 'util/function';
import { LensResult, ModLens, modLens } from 'util/lens';
import { flattenPair, Pair, Tuple4 } from 'util/tuple';
import * as PO from './pos';
import { Pos } from './pos';
import * as SZ from './size';
import { Size } from './size';

export interface Rect {
  pos: Pos;
  size: Size;
  zOrder: number;
}

//#region build
export const build: Binary<Pos, Size, Rect> = (pos, size) => ({
    pos,
    size,
    zOrder: 0,
  }),
  tupled: Unary<[Pos, Size], Rect> = FN.tupled(build),
  fromPos: Unary<Pos, Rect> = p => build(p, SZ.empty),
  atOrigin: Unary<Size, Rect> = sz => build(PO.origin, sz),
  empty = build(PO.origin, SZ.empty),
  fromQuad: Unary<Pair<Pair<number>>, Rect> = FN.flow(
    TU.bimap(SZ.tupled, PO.tupled),
    tupled,
  ),
  fromTuple: Unary<Tuple4<number>, Rect> = ([a, b, c, d]) =>
    fromQuad([
      [a, b],
      [c, d],
    ]),
  fromCorners: Unary<Pair<Pos>, Rect> = ([fst, snd]) =>
    build(fst, PO.rectSize([fst, snd]));
//#endregion

//#region query
export const [halfWidth, halfHeight]: Pair<Unary<Rect, number>> = [
    ({ size: { width } }) => Math.floor((width - 1) / 2),
    ({ size: { height } }) => Math.floor((height - 1) / 2),
  ],
  isEmpty: PRE.Predicate<Rect> = ({ pos, size, zOrder }) =>
    PO.isOrigin(pos) && SZ.isEmpty(size) && zOrder === 0;

//#endregion

//#region direct lenses
const id = LE.id<Rect>();

export const size = FN.pipe(id, LE.prop('size'), modLens),
  pos = FN.pipe(id, LE.prop('pos'), modLens),
  zOrder = FN.pipe(id, LE.prop('zOrder'), modLens),
  top = FN.pipe(pos, LE.compose(PO.top), modLens),
  left = FN.pipe(pos, LE.compose(PO.left), modLens),
  width = FN.pipe(size, LE.compose(SZ.width), modLens),
  height = FN.pipe(size, LE.compose(SZ.height), modLens);

const directLenses = { size, pos, zOrder, top, left, width, height } as const;
//#endregion

//#region computed lenses
export const right: ModLens<Rect, number> = modLens({
    get: r => left.get(r) + width.get(r) - 1,
    set: n => r => FN.pipe(r, left.set(n - width.get(r) + 1)),
  }),
  bottom: ModLens<Rect, number> = modLens({
    get: r => top.get(r) + height.get(r) - 1,
    set: n => r => FN.pipe(r, top.set(n - height.get(r) + 1)),
  }),
  bottomRight: ModLens<Rect, Pos> = modLens({
    get: r => PO.build(bottom.get(r), right.get(r)),
    set: p => r => FN.pipe(r, bottom.set(p.top), right.set(p.left)),
  }),
  topRight: ModLens<Rect, Pos> = modLens({
    get: r => PO.build(top.get(r), right.get(r)),
    set: p => r => FN.pipe(r, top.set(p.top), right.set(p.left)),
  }),
  bottomLeft: ModLens<Rect, Pos> = modLens({
    get: r => PO.build(bottom.get(r), left.get(r)),
    set: p => r => FN.pipe(r, bottom.set(p.top), left.set(p.left)),
  }),
  center: ModLens<Rect, number> = modLens({
    get: r => left.get(r) + halfWidth(r),
    set: n => r => FN.pipe(r, left.set(n - halfWidth(r))),
  }),
  middle: ModLens<Rect, number> = modLens({
    get: r => top.get(r) + halfHeight(r),
    set: n => r => FN.pipe(r, top.set(n - halfHeight(r))),
  }),
  middleCenter: ModLens<Rect, Pos> = modLens({
    get: r => PO.build(middle.get(r), center.get(r)),
    set: ({ top: givenTop, left: givenLeft }) =>
      FN.flow(middle.set(givenTop), center.set(givenLeft)),
  });

const computedLenses = {
  right,
  bottom,
  bottomRight,
  topRight,
  bottomLeft,
  center,
  middle,
  middleCenter,
} as const;
//#endregion

//#region lenses
export const lenses = { ...directLenses, ...computedLenses } as const;

export type RectLens = typeof lenses;
export type RectLensKey = keyof RectLens;
export type RectLensResult<K extends RectLensKey> = LensResult<RectLens[K]>;

export const lensAt = <K extends RectLensKey>(k: K) =>
  lenses[k] as RectLens[K] & ModLens<Rect, RectLensResult<K>>;
//#endregion

//#region modify
export const addT: BinOpT<Rect> = ([fst, snd]) =>
    isEmpty(fst)
      ? snd
      : isEmpty(snd)
      ? fst
      : fromCorners([minTopLeft([fst, snd]), maxBottomRight([fst, snd])]),
  add: BinOp<Rect> = (fst, snd) => addT([fst, snd]),
  addC: BinOpC<Rect> = curry2(add);

type SetNum = Unary<number, Endo<Rect>>;

export const addPos: Unary<Pos, Endo<Rect>> = FN.flow(PO.addC, pos.mod),
  addRect: Unary<Rect, Endo<Rect>> = curry2(add),
  subPos: Unary<Pos, Endo<Rect>> = FN.flow(PO.subC, pos.mod),
  addSize: Unary<Size, Endo<Rect>> = FN.flow(SZ.addC, size.mod),
  subSize: Unary<Size, Endo<Rect>> = FN.flow(SZ.subC, size.mod),
  addTop: SetNum = FN.flow(PO.addTop, pos.mod),
  subTop: SetNum = FN.flow(PO.subTop, pos.mod),
  addLeft: SetNum = FN.flow(PO.addLeft, pos.mod),
  subLeft: SetNum = FN.flow(PO.subLeft, pos.mod),
  addWidth: SetNum = FN.flow(SZ.addWidth, size.mod),
  subWidth: SetNum = FN.flow(SZ.subWidth, size.mod),
  addHeight: SetNum = FN.flow(SZ.addHeight, size.mod),
  subHeight: SetNum = FN.flow(SZ.subHeight, size.mod),
  incSize: Endo<Rect> = FN.pipe(SZ.unitSquare, SZ.addC, size.mod),
  decSize: Endo<Rect> = FN.pipe(SZ.unitSquare, SZ.subC, size.mod),
  scaleH: SetNum = FN.flow(SZ.scaleH, size.mod),
  scaleV: SetNum = FN.flow(SZ.scaleV, size.mod),
  scale: SetNum = FN.flow(SZ.scale, size.mod);

export const shifts = {
  addRect,
  addPos,
  subPos,
  addSize,
  subSize,
  addTop,
  subTop,
  addLeft,
  subLeft,
  addWidth,
  subWidth,
  addHeight,
  subHeight,
  scaleH,
  scaleV,
  scale,
} as const;

export type RectShift = typeof shifts;
export type RectShiftKey = keyof RectShift;
export type RectShiftArg<K extends RectShiftKey> = Parameters<RectShift[K]>[0];

export const shiftAt = <K extends RectShiftKey>(k: K) =>
  shifts[k] as RectShift[K] & Unary<RectShiftArg<K>, Endo<Rect>>;
//#endregion

//#region zOrder
export const incZOrder = zOrder.mod(increment),
  decZOrder = zOrder.mod(decrement),
  unsetZOrder = zOrder.set(0);
//#endregion

//#region instances
export const eqPos: EQ.Eq<Rect> = FN.pipe(PO.eq, EQ.contramap(pos.get)),
  eqSize: EQ.Eq<Rect> = FN.pipe(SZ.eq, EQ.contramap(size.get)),
  equals: Unary<Rect, PRE.Predicate<Rect>> = fst => snd =>
    eqPos.equals(fst, snd) && eqSize.equals(fst, snd),
  eq: EQ.Eq<Rect> = FN.pipe(equals, uncurry2T, EQ.fromEquals),
  show: SH.Show<Rect> = {
    show: ({ pos, size }) => PO.show.show(pos) + ' ' + SZ.show.show(size),
  },
  /** Monoid for the bounding rectangle operation */
  monoid: MO.Monoid<Rect> = { concat: add, empty };
//#endregion

//#region query
export const toQuad = <R extends Rect>({
    pos: { top, left },
    size: { width, height },
  }: R): Pair<Pair<number>> => [
    [top, left],
    [width, height],
  ],
  toTuple = FN.flow(toQuad, flattenPair),
  getCorners: Unary<Rect, Pair<Pos>> = fork([pos.get, bottomRight.get]),
  minTopLeft: Unary<Rect[], Pos> = rs =>
    FN.pipe(rs, AR.map(pos.get), rs => PO.min(rs)),
  maxBottomRight = (rs: Rect[]): Pos =>
    FN.pipe(rs, AR.map(bottomRight.get), rs => PO.max(rs)),
  area = FN.flow(size.get, SZ.area);
//#endregion

//#region operations
/**
 * Normalize positions of a non-empty list of rectangles
 *
 * Translates all rectangles to the positive quadrant
 */
export const translateToPositive = (rs: Rect[]): Rect[] =>
    FN.pipe(
      rs,
      AR.map(pos.get),
      PO.translateToPositive,
      AR.zip(rs),
      AR.map(([p, r]) => FN.pipe(r, pos.set(p))),
    ),
  stack: Unary<Rect[], Rect> = MO.concatAll(monoid);
//#endregion

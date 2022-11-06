import {
  array as AR,
  eq as EQ,
  function as FN,
  monoid as MO,
  nonEmptyArray as NEA,
  number as NU,
  option as OP,
  predicate as PRE,
  readonlyArray as RA,
} from 'fp-ts';
import { maximum } from 'fp-ts-std/Array';
import { uncurry2 } from 'fp-ts-std/Function';
import { unwords } from 'fp-ts-std/String';
import * as LE from 'monocle-ts/lib/Lens';
import { Lens } from 'monocle-ts/lib/Lens';
import * as AL from 'src/align';
import * as GE from 'src/geometry';
import { Endo, Unary } from 'util/function';
import { ModLens, modLens } from 'util/lens';
import { typedKeys } from 'util/object';
import { Block } from './types';

export const rect: ModLens<Block, GE.Rect> = FN.pipe(
  LE.id<Block>(),
  LE.prop('rect'),
  modLens,
);

export type RectShift<T, K extends GE.RectShiftKey> = Unary<
  GE.RectShiftArg<K>,
  Endo<T>
>;

export const rectShift = <T>(l: ModLens<T, GE.Rect>) =>
  FN.pipe(
    typedKeys(GE.rect.shifts),
    RA.map(k => [k, FN.flow(GE.rect.shiftAt(k), l.mod)]),
    Object.fromEntries,
  ) as { [K in GE.RectShiftKey]: RectShift<T, K> };

export type RectLens<T, K extends GE.RectLensKey> = ModLens<
  T,
  GE.RectLensResult<K>
>;

export const rectLenses = <T>(l: ModLens<T, GE.Rect>) =>
  FN.pipe(
    typedKeys(GE.rect.lenses),
    RA.map(k => [
      k,
      FN.pipe(l, FN.pipe(k, GE.rect.lensAt, LE.compose), modLens),
    ]),
    Object.fromEntries,
  ) as { [K in GE.RectLensKey]: RectLens<T, K> };

export const eqs = <T>(
  get: Unary<T, GE.Rect>,
): Record<'eqPos' | 'eqSize' | 'eqRect', EQ.Eq<T>> => ({
  eqPos: FN.pipe(GE.rect.eqPos, EQ.contramap(get)),
  eqSize: FN.pipe(GE.rect.eqSize, EQ.contramap(get)),
  eqRect: FN.pipe(GE.rect.eq, EQ.contramap(get)),
});

export const showRect: Unary<Block, string> = ({ rect, align, blend }) =>
  FN.pipe([GE.rect.show.show(rect), AL.align.show(align), blend], unwords);

export const translateToPositiveFor =
    <T>(l: Lens<T, GE.Rect>): Endo<T[]> =>
    layouts => {
      const rects = FN.pipe(layouts, AR.map(l.get));

      return FN.pipe(
        GE.rect.translateToPositive(rects),
        AR.zip(layouts),
        FN.pipe(l.set, uncurry2, AR.map),
      );
    },
  minTopLeftFor =
    <T>(l: Lens<T, GE.Rect>) =>
    (ps: T[]): GE.Pos =>
      FN.pipe(ps, AR.map(l.get), GE.rect.minTopLeft),
  maxBottomRightFor =
    <T>(l: Lens<T, GE.Rect>) =>
    (ts: T[]): GE.Pos =>
      FN.pipe(ts, AR.map(l.get), GE.rect.maxBottomRight);

export const hasSize: PRE.Predicate<Block> = PRE.not(
    FN.flow(rect.get, GE.rect.size.get, GE.size.isEmpty),
  ),
  bounds: Unary<Block[], GE.Size> = FN.flow(
    AR.map(rect.get),
    MO.concatAll(GE.rect.monoid),
    GE.rect.size.get,
  ),
  incZOrder = rect.mod(GE.rect.incZOrder),
  decZOrder = rect.mod(GE.rect.decZOrder),
  unsetZOrder = rect.mod(GE.rect.unsetZOrder),
  corners = FN.flow(rect.get, GE.rect.getCorners),
  translateToPositive = translateToPositiveFor(rect),
  minTopLeft = minTopLeftFor(rect),
  maxBottomRight = maxBottomRightFor(rect),
  area = FN.flow(rect.get, GE.rect.area),
  [incSize, decSize] = [rect.mod(GE.rect.incSize), rect.mod(GE.rect.decSize)];

export const delegateRect = <T>(l: ModLens<T, GE.Rect>) =>
  ({
    ...rectShift(l),
    ...rectLenses(l),
    ...eqs(l.get),
  } as const);

export const withRect = delegateRect(rect);

const getWidth = withRect.width.get;

export const maxWidth: Unary<Block[], number> = FN.flow(
  AR.map(getWidth),
  NEA.fromArray,
  OP.fold(FN.constant(0), maximum(NU.Ord)),
);

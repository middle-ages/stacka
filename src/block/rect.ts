import {
  option as OP,
  number as NU,
  nonEmptyArray as NEA,
  array as AR,
  eq as EQ,
  function as FN,
  monoid as MO,
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
import { Endo, NonEmptyEndo, Unary } from 'util/function';
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
    <T>(l: Lens<T, GE.Rect>): NonEmptyEndo<T> =>
    (fst, ...rest) => {
      const layouts = [fst, ...rest],
        [fstRect, ...restRect] = FN.pipe(layouts, AR.map(l.get));

      return FN.pipe(
        GE.rect.translateToPositive(fstRect, ...restRect),
        AR.zip(layouts),
        FN.pipe(l.set, uncurry2, AR.map),
      );
    },
  minTopLeftFor =
    <T>(l: Lens<T, GE.Rect>) =>
    (fst: T, ...rest: T[]): GE.Pos =>
      FN.pipe([fst, ...rest], AR.map(l.get), ([fst, ...rest]) =>
        GE.rect.minTopLeft(fst, ...rest),
      ),
  maxBottomRightFor =
    <T>(l: Lens<T, GE.Rect>) =>
    (fst: T, ...rest: T[]): GE.Pos =>
      FN.pipe([fst, ...rest], AR.map(l.get), ([fst, ...rest]) =>
        GE.rect.maxBottomRight(fst, ...rest),
      );

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
  corners = FN.flow(rect.get, GE.rect.corners),
  translateToPositive = translateToPositiveFor(rect),
  minTopLeft = minTopLeftFor(rect),
  maxBottomRight = maxBottomRightFor(rect),
  area = FN.flow(rect.get, GE.rect.area),
  incSize = rect.mod(GE.rect.incSize);

export const withRect = {
  ...rectShift(rect),
  ...rectLenses(rect),
  ...eqs(rect.get),
} as const;

const getWidth = withRect.width.get;

export const maxWidth: Unary<Block[], number> = FN.flow(
  AR.map(getWidth),
  NEA.fromArray,
  OP.fold(FN.constant(0), maximum(NU.Ord)),
);

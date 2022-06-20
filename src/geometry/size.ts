import {
  array as AR,
  eq as EQ,
  function as FN,
  monoid as MO,
  number as NU,
  ord as OD,
  predicate as PRE,
  readonlyArray as RA,
  show as SH,
} from 'fp-ts';
import { curry2, fork } from 'fp-ts-std/Function';
import { increment } from 'fp-ts/lib/function';
import * as LE from 'monocle-ts/lib/Lens';
import stringWidth from 'string-width';
import { emptyJoin } from 'util/array';
import { maxPositiveMonoid, monoOrdStruct } from 'util/fp-ts';
import { BinaryC, Endo, Unary } from 'util/function';
import { propLens } from 'util/lens';
import { mapValues, ModifierOf, objectMono, typedValues } from 'util/object';
import { Row, Char, MaybeChar, orSpace } from 'util/string';
import { Pair, pairMap } from 'util/tuple';
import { RowList } from '../types';

export const sizeKeys = ['width', 'height'] as const;

export type SizeKeys = typeof sizeKeys;
export type SizeKey = SizeKeys[number] & string;
export type Size = Record<SizeKey, number>;

export const mapSizeKeys = <R>(f: Unary<SizeKey, R>): Pair<R> =>
  FN.pipe([...sizeKeys], pairMap(f));

export const size: Unary<Pair<number>, Size> = ([width, height]) => ({
    width,
    height,
  }),
  width: Unary<number, Size> = width => ({ width, height: 0 }),
  height: Unary<number, Size> = height => ({ width: 0, height }),
  sizePair: Unary<Size, Pair<number>> = typedValues,
  sizeLenses = FN.pipe(propLens<Size>(), mapSizeKeys),
  [sizeWidthLens, sizeHeightLens] = sizeLenses,
  getWidth: Unary<Size, number> = sizeWidthLens.get,
  getHeight: Unary<Size, number> = sizeHeightLens.get,
  incSize: Endo<Size> = mapValues(increment),
  rowWidth: Unary<Row, Size> = FN.flow(stringWidth, width);

export const modSizeWidth: ModifierOf<Size, 'width'> = f =>
    FN.pipe(sizeWidthLens, LE.modify(f)),
  modSizeHeight: ModifierOf<Size, 'height'> = f =>
    FN.pipe(sizeHeightLens, LE.modify(f));

export const showSize: SH.Show<Size> = {
  show: ({ width, height }) => `w:${width},h:${height}`,
};

export const fillSize: BinaryC<Char, Size, RowList> =
  c =>
  ({ width, height }) =>
    FN.pipe(
      AR.replicate(width, c),
      emptyJoin,
      FN.pipe(height, curry2(AR.replicate)),
    );

export const fillOrSpace: BinaryC<MaybeChar, Size, RowList> = FN.flow(
  orSpace,
  fillSize,
);

export const sizeMonoid: Unary<MO.Monoid<number>, MO.Monoid<Size>> = (
    monoid: MO.Monoid<number>,
  ) => FN.pipe(monoid, objectMono(sizeKeys), MO.struct),
  emptySize = sizeMonoid(NU.MonoidSum).empty,
  maxSizeMonoid: MO.Monoid<Size> = sizeMonoid(maxPositiveMonoid), // size≥0
  sumSizeMonoid: MO.Monoid<Size> = sizeMonoid(NU.MonoidSum),
  sizeOrd: OD.Ord<Size> = FN.pipe(sizeKeys, monoOrdStruct(NU.Ord)),
  sizeEq: EQ.Eq<Size> = EQ.struct({ width: NU.Eq, height: NU.Eq }),
  fillSpace = fillSize(' ');

export const isSizeZero: PRE.Predicate<Size> = FN.pipe(
  emptySize,
  curry2(sizeEq.equals),
);

export const maxRowWidth: Unary<readonly Row[], number> = FN.flow(
  RA.map(rowWidth),
  MO.concatAll(maxSizeMonoid),
  getWidth,
);

/** Given a row, returns its width delta vs. given width */
export const deltaMaxWidth: BinaryC<number, Row, number> = width => s =>
  width - rowWidth(s).width;

export const measureRowData: Unary<RowList, Size> = data =>
  FN.pipe(data, fork([maxRowWidth, RA.size]), size);

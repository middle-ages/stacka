import { function as FN, option as OP, show as SH, tuple as TU } from 'fp-ts';
import { curry2 } from 'fp-ts-std/Function';
import * as LE from 'monocle-ts/lib/Lens';
import { RowList } from 'src/types';
import { Binary, BinaryC, Unary } from 'util/function';
import { around, MaybeRow, orSpace } from 'util/string';
import { flattenPair, Pair, Tuple4 } from 'util/tuple';
import { origin, Pos, posT, showPos } from './pos';
import { emptySize, fillSize, showSize, Size, size } from './size';

export interface Rect {
  pos: Pos;
  size: Size;
  /**
   * Character to fill when expanding block to fit given size.
   * Default is the space character, which is what you usually
   * use to pad things.
   */
  fillChar: MaybeRow;
}

const buildRect: Binary<Pos, Size, Rect> = (pos, size) => ({
    pos,
    size,
    fillChar: OP.none,
  }),
  tupled: Unary<[Pos, Size], Rect> = FN.tupled(buildRect),
  curried: BinaryC<Pos, Size, Rect> = curry2(buildRect),
  atOrigin: Unary<Size, Rect> = curried(origin),
  empty = atOrigin(emptySize);

const fromQuad: Unary<Pair<Pair<number>>, Rect> = FN.flow(
    TU.bimap(size, posT),
    tupled,
  ),
  toQuad = <R extends Rect>({
    pos: { top, left },
    size: { width, height },
  }: R): Pair<Pair<number>> => [
    [top, left],
    [width, height],
  ];

const fromTuple: Unary<Tuple4<number>, Rect> = ([a, b, c, d]) =>
    fromQuad([
      [a, b],
      [c, d],
    ]),
  toTuple = FN.flow(toQuad, flattenPair);

const paint = <R extends Rect>(r: R): RowList =>
  FN.pipe(r.size, FN.pipe(r.fillChar, orSpace, fillSize));

export const rectLensFor = <T extends Rect>() => {
  const id = LE.id<T>(),
    size = FN.pipe(id, LE.prop('size')),
    pos = FN.pipe(id, LE.prop('pos')),
    fillChar = FN.pipe(id, LE.prop('fillChar'));

  return {
    size,
    pos,
    fillChar,
    width: FN.pipe(size, LE.prop('width')),
    height: FN.pipe(size, LE.prop('height')),
    top: FN.pipe(pos, LE.prop('top')),
    left: FN.pipe(pos, LE.prop('left')),
  } as const;
};

export const rectLens = rectLensFor<Rect>();

export type RectLens = typeof rectLens;

const exported = {
  tupled,
  curried,
  atOrigin,
  empty,
  fromQuad,
  toQuad,
  fromTuple,
  toTuple,
  paint,
  ...rectLens,
};

type Exported = typeof exported;

export interface rect extends Exported {
  (pos: Pos, size: Size): Rect;
}

export const rect = buildRect as rect;

Object.assign(rect, exported);

export const showRect: SH.Show<Rect> = {
  show: r =>
    [
      FN.pipe(r, rect.pos.get, showPos.show),
      FN.pipe(r, rect.size.get, showSize.show, around('[', ']')),
    ].join(' '),
};

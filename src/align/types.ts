import { function as FN, readonlyArray as RA } from 'fp-ts';
import { flip, uncurry2 } from 'fp-ts-std/Function';
import { toFst } from 'fp-ts-std/Tuple';
import { HDir, VDir } from 'src/geometry';
import { BinaryC, Unary } from 'util/function';
import { typedFromEntries } from 'util/object';
import { ucFirst } from 'util/string';
import { Pair, Tuple3 } from 'util/tuple';

export const hAlign = ['left', 'center', 'right'] as const,
  vAlign = ['top', 'middle', 'bottom'] as const;

export type HAlign = typeof hAlign[number];
export type VAlign = typeof vAlign[number];

/** A horizontal or vertical alignment */
export type OrientAlign = HAlign | VAlign;

/** A pair of `OrientAlign`s on same orientation, possibly identical */
export type OrientPair = Pair<HAlign> | Pair<VAlign>;

/** A horizontal dir + vertical alignment, E.g.: `['left','top'] */
export type HAlignPair = [HDir, VAlign];

/** A vertical dir + horizontal alignment, E.g.: `['bottom','center'] */
export type VAlignPair = [VDir, HAlign];

/** A pair of dir + orthogonal (to the dir) alignment */
export type AlignPair = HAlignPair | VAlignPair;

export type DupAlign<A extends OrientAlign> = A extends HAlign
  ? Pair<HAlign>
  : Pair<VAlign>;

export interface Align {
  horizontal: HAlign;
  vertical: VAlign;
}

export const hvAlign: BinaryC<HAlign, VAlign, Align> =
    horizontal => vertical => ({
      horizontal,
      vertical,
    }),
  vhAlign = flip(hvAlign),
  pairVAlign: Unary<[VAlign, HAlign], Align> = uncurry2(vhAlign),
  pairHAlign: Unary<[HAlign, VAlign], Align> = uncurry2(hvAlign);

/** Match by horizontal alignment */
export const matchHAlign =
  <R>(left: R, center: R, right: R): Unary<HAlign, R> =>
  v =>
    v === 'left' ? left : v === 'center' ? center : right;

/** Match by vertical alignment */
export const matchVAlign =
  <R>(top: R, middle: R, bottom: R): Unary<VAlign, R> =>
  v =>
    v === 'top' ? top : v === 'middle' ? middle : bottom;

export const mapHAlign = <R>(f: Unary<HAlign, R>) =>
    FN.pipe(hAlign, RA.map(f)) as Tuple3<R>,
  mapVAlign = <R>(f: Unary<VAlign, R>) =>
    FN.pipe(vAlign, RA.map(f)) as Tuple3<R>;

export type Alignment<
  V extends VAlign = VAlign,
  H extends HAlign = HAlign,
> = `${V}${Capitalize<H>}`;

export const toAlignment = ({ horizontal, vertical }: Align) =>
  `${vertical}${ucFirst(horizontal)}` as Alignment;

export type Alignments = Record<Alignment, Align>;

export const alignments: Alignments = FN.pipe(
  vAlign,
  RA.chain(v =>
    FN.pipe(hAlign, RA.map(FN.flow(vhAlign(v), toFst(toAlignment)))),
  ),
  typedFromEntries,
);

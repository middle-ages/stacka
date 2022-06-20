import { function as FN, readonlyArray as RA } from 'fp-ts';
import { flip, uncurry2 } from 'fp-ts-std/Function';
import { BinaryC, Unary } from 'util/function';
import { typedFromEntries } from 'util/object';
import { ucFirst } from 'util/string';
import { squareMapFst } from 'util/tuple';

export const hAlign = ['left', 'center', 'right'] as const,
  vAlign = ['top', 'middle', 'bottom'] as const;

export type HAlign = typeof hAlign[number];
export type VAlign = typeof vAlign[number];

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
    FN.pipe(hAlign, RA.map(FN.flow(vhAlign(v), squareMapFst(toAlignment)))),
  ),
  typedFromEntries,
);

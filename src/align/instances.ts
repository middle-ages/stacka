import {
  function as FN,
  number as NU,
  ord as OD,
  predicate as PRE,
  show as SH,
  tuple as TU,
} from 'fp-ts';
import { curry2 } from 'fp-ts-std/Function';
import { min } from 'fp-ts/lib/Ord';
import { zip } from 'util/array';
import { ordStruct } from 'util/fp-ts';
import { BinOp, Unary } from 'util/function';
import { typedFromEntries } from 'util/object';
import { Align, hAlign, HAlign, vAlign, VAlign } from './types';

const alignSym = {
  top: {
    left: '⭶',
    center: '⭱',
    right: '⭷',
  },
  middle: {
    left: '⭰',
    center: '×',
    right: '⭲',
  },
  bottom: {
    left: '⭹',
    center: '⭳',
    right: '⭸',
  },
};

const zipIndex = zip([0, 1, 2]),
  [hAlignIndex, vAlignIndex]: [Record<HAlign, number>, Record<VAlign, number>] =
    FN.pipe(
      [[...hAlign], [...vAlign]] as [HAlign[], VAlign[]],
      TU.bimap(
        FN.flow(zipIndex, typedFromEntries),
        FN.flow(zipIndex, typedFromEntries),
      ),
    ),
  [hIdx, vIdx]: [Unary<HAlign, number>, Unary<VAlign, number>] = [
    h => hAlignIndex[h],
    v => vAlignIndex[v],
  ];

export const showAlign: SH.Show<Align> = {
  show: ({ horizontal, vertical }) => alignSym[vertical][horizontal],
};

export const [hAlignOrd, vAlignOrd]: [OD.Ord<HAlign>, OD.Ord<VAlign>] = [
  FN.pipe(NU.Ord, OD.contramap(hIdx)),
  FN.pipe(NU.Ord, OD.contramap(vIdx)),
];

export const alignOrd: OD.Ord<Align> = FN.pipe(
  {
    horizontal: hAlignOrd,
    vertical: vAlignOrd,
  },
  FN.pipe(OD.getMonoid<Align>(), ordStruct),
);

export const alignEq: Unary<Align, PRE.Predicate<Align>> = curry2(
  alignOrd.equals,
);

/** Select the `Align` that sorts first */
export const minSortedAlign: BinOp<Align> = min(alignOrd);

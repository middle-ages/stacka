import {
  array as AR,
  eq as EQ,
  function as FN,
  number as NU,
  ord as OD,
  predicate as PRE,
  show as SH,
  tuple as TU,
} from 'fp-ts';
import { curry2 } from 'fp-ts-std/Function';
import { min } from 'fp-ts/lib/Ord';
import { ordStruct } from 'util/fp-ts';
import { BinOp, Unary, uncurry2T } from 'util/function';
import { typedFromEntries } from 'util/object';
import { Align, hAlign, HAlign, vAlign, VAlign } from './types';

export const alignSym = {
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

export const hAlignSym = { left: '⭰', center: '×', right: '⭲' },
  vAlignSym = { top: '⭱', middle: '×', bottom: '⭳' };

const zipIndex = AR.zip([0, 1, 2]),
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

const Show: SH.Show<Align> = {
  show: ({ horizontal, vertical }) => alignSym[vertical][horizontal],
};

const [hAlignOrd, vAlignOrd]: [OD.Ord<HAlign>, OD.Ord<VAlign>] = [
  FN.pipe(NU.Ord, OD.contramap(hIdx)),
  FN.pipe(NU.Ord, OD.contramap(vIdx)),
];

const ord: OD.Ord<Align> = FN.pipe(
  {
    horizontal: hAlignOrd,
    vertical: vAlignOrd,
  },
  FN.pipe(OD.getMonoid<Align>(), ordStruct),
);

const equals: Unary<Align, PRE.Predicate<Align>> = curry2(ord.equals),
  eq: EQ.Eq<Align> = EQ.fromEquals(uncurry2T(equals));

/** Select the `Align` that sorts first */
const minSorted: BinOp<Align> = min(ord);

export const exportInstances = {
  Show,
  alignSym,
  eq,
  equals,
  hAlignOrd,
  hAlignSym,
  minSorted,
  ord,
  show: Show.show,
  vAlignOrd,
  vAlignSym,
} as const;

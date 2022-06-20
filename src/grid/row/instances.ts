import * as fc from 'fast-check';
import {
  array as AR,
  eq as EQ,
  function as FN,
  monoid as MO,
  show as SH,
} from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { BlendMode } from 'src/color';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { cell as CE } from '../cell/cell';
import { stack } from './stack';
import { Row } from './types';

export const eq: EQ.Eq<Row> = AR.getEq(CE.eq),
  show: SH.Show<Row> = AR.getShow(CE.show);

export const getMonoid: Unary<BlendMode, MO.Monoid<Row>> = blend => ({
  empty: [],
  concat: FN.pipe(blend, stack, FN.untupled),
});

export const [monoid, underMonoid]: Pair<MO.Monoid<Row>> = FN.pipe(
  ['over', 'under'],
  mapBoth(getMonoid),
);

export const getArb: Unary<number, fc.Arbitrary<Row>> = count =>
  FN.pipe(AR.replicate(count, CE.arb), FN.tupled(fc.tuple)).map(AR.flatten);

export const getNarrowOrNoneArb: Unary<number, fc.Arbitrary<Row>> = count =>
  FN.pipe(AR.replicate(count, CE.narrowOrNoneArb), FN.tupled(fc.tuple));

import * as fc from 'fast-check';
import {
  eq as EQ,
  function as FN,
  monoid as MO,
  number as NU,
  option as OP,
  predicate as PRE,
  show as SH,
} from 'fp-ts';
import { getOption } from 'fp-ts-laws/lib/Option';
import { curry2 } from 'fp-ts-std/Function';
import { contramap } from 'fp-ts-std/Show';
import { mapBoth } from 'fp-ts-std/Tuple';
import { blendMaybeColor } from 'src/color/blend';
import { Pair } from 'util/tuple';
import { recordEq } from 'util/fp-ts';
import { Unary } from 'util/function';
import * as BU from './build';
import { normalize } from './convert';
import { Color, MaybeColor } from './named';
import { BlendMode, Rgba } from './types';

export const eqRgb: EQ.Eq<Rgba> = recordEq<Rgba>(NU.Eq)(['r', 'g', 'b', 'a']);

export const eq: EQ.Eq<Color> = FN.pipe(eqRgb, EQ.contramap(normalize));

export const maybeEq: EQ.Eq<MaybeColor> = OP.getEq(eq);

export const equals: Unary<Color, PRE.Predicate<Color>> = curry2(eq.equals);

export const showRgb: SH.Show<Rgba> = {
  show: ({ r, g, b, a }) =>
    [
      `R:${r.toFixed(0)}`,
      `G:${g.toFixed(0)}`,
      `B:${b.toFixed(0)}`,
      `A:${a.toFixed(2)}`,
    ].join(' '),
};

export const show: SH.Show<Color> = FN.pipe(
  showRgb,
  contramap<Color, Rgba>(normalize),
);

export const getMonoid: Unary<BlendMode, MO.Monoid<MaybeColor>> = blend => ({
  empty: OP.none,
  concat: FN.pipe(blend, blendMaybeColor, FN.untupled),
});

export const [monoid, underMonoid]: Pair<MO.Monoid<MaybeColor>> = FN.pipe(
  ['over', 'under'],
  mapBoth(getMonoid),
);

const [a, b] = [fc.nat(100).map(x => x / 100), fc.nat(255)];

export const arb: fc.Arbitrary<Color> = fc.tuple(b, b, b, a).map(BU.rgba);

export const maybeArb: fc.Arbitrary<MaybeColor> = getOption(arb);

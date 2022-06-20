import * as fc from 'fast-check';
import {
  boolean as BO,
  eq as EQ,
  function as FN,
  monoid as MO,
  option as OP,
  readonlyArray as RA,
  show as SH,
} from 'fp-ts';
import { mapBoth, withSnd } from 'fp-ts-std/Tuple';
import { BlendMode, color, MaybeColor } from 'src/color';
import { maybeArb } from 'src/color/instances';
import { typedFromEntries } from 'util/object';
import { Pair } from 'util/tuple';
import { Binary, Unary } from 'util/function';
import { isEmpty, hasDecorations, getDecorations } from './lens';
import { Decoration, decorations, Style } from './types';

export const eq: EQ.Eq<Style> = EQ.struct({
  fg: OP.getEq(color.eq),
  bg: OP.getEq(color.eq),
  bold: BO.Eq,
  italic: BO.Eq,
  underline: BO.Eq,
  inverse: BO.Eq,
  strikethrough: BO.Eq,
});

export const showColor: Binary<string, MaybeColor, string> = (head, c) =>
  `${head}: “` +
  FN.pipe(c, OP.fold(FN.constant('none'), color.show.show)) +
  '”';

export const show: SH.Show<Style> = {
  show: st =>
    isEmpty(st)
      ? 'style=∅'
      : `${showColor('fg', st.fg)}, ${showColor('bg', st.bg)}` +
        (hasDecorations(st) ? ', ' + getDecorations(st).join(', ') : ''),
};

export const getMonoid: Unary<BlendMode, MO.Monoid<Style>> = blend => {
  const colorMonoid = color.getMonoid(blend);
  return MO.struct({
    fg: colorMonoid,
    bg: colorMonoid,
    bold: BO.MonoidAny,
    italic: BO.MonoidAny,
    underline: BO.MonoidAny,
    inverse: BO.MonoidAny,
    strikethrough: BO.MonoidAny,
  });
};

export const [monoid, underMonoid]: Pair<MO.Monoid<Style>> = FN.pipe(
  ['under', 'over'],
  mapBoth(getMonoid),
);

const colorsArb = fc.record({ fg: color.maybeArb, bg: maybeArb });

const decoArb: Record<Decoration, fc.Arbitrary<boolean>> = FN.pipe(
  decorations,
  RA.map(withSnd(fc.boolean())),
  typedFromEntries,
);

export const arb: fc.Arbitrary<Style> = fc
  .tuple(colorsArb, fc.record(decoArb))
  .map(([colors, decos]) => ({ ...colors, ...decos }));

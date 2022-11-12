import { eq as EQ, function as FN, monoid as MO, show as SH } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { BlendMode, blend } from './blend';
import { toRgbaColor, normalize, Color } from './types';
import { isEmpty } from './ops';

export const eq: EQ.Eq<Color> = {
  equals: (a, b) => normalize(a) === normalize(b),
};

export const show: SH.Show<Color> = {
  show: c => {
    if (isEmpty(c)) return 'none';
    const { r, g, b, a } = toRgbaColor(c);
    return [`R:${r}`, `G:${g}`, `B:${b}`, `A:${a.toFixed(2)}`].join(' ');
  },
};

export const getMonoid: Unary<BlendMode, MO.Monoid<Color>> = mode => ({
  empty: 0,
  concat: FN.pipe(mode, blend, FN.untupled),
});

export const [overMonoid, underMonoid]: Pair<MO.Monoid<Color>> = FN.pipe(
  ['combineOver', 'combineUnder'],
  mapBoth(getMonoid),
);

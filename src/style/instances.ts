import { eq as EQ, function as FN, monoid as MO, show as SH } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import * as color from 'src/color';
import { BlendMode } from 'src/color';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { blend } from './blend';
import { bgLens, deco, decoList, fgLens } from './lens';
import * as TY from './types';
import { Style } from './types';

export const eq: EQ.Eq<Style> = {
  equals: (a, b) => {
    const [fg1, bg1, deco1] = a,
      [fg2, bg2, deco2] = b;
    return fg1 === fg2 && bg1 === bg2 && deco1 === deco2;
  },
};

export const show: SH.Show<Style> = {
  show: st =>
    TY.isEmpty(st)
      ? 'style=∅'
      : `${color.show.show(fgLens.color.get(st))}, ${color.show.show(
          bgLens.color.get(st),
        )}, ` + (deco.get(st) === 0 ? 'deco=∅' : decoList.get(st).join(', ')),
};

export const getMonoid: Unary<BlendMode, MO.Monoid<Style>> = mode => ({
  empty: TY.empty,
  concat: FN.pipe(mode, blend, FN.untupled),
});

export const [overMonoid, underMonoid]: Pair<MO.Monoid<Style>> = FN.pipe(
  ['combineOver', 'combineUnder'],
  mapBoth(getMonoid),
);

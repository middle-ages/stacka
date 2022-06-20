import * as fc from 'fast-check';
import {
  function as FN,
  monoid as MO,
  array as AR,
  eq as EQ,
  show as SH,
} from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { size as SZ } from 'src/geometry';
import { BlendMode } from 'src/color';
import { Pair } from 'util/tuple';
import { Unary } from 'util/function';
import { row } from './row/row';
import { matchCell } from './cell/types';
import { Grid } from './types';
import { measure, empty, stack, mapCells } from './ops';
import { sum } from 'fp-ts-std/Array';

const [k0, k1] = FN.pipe([0, 1], mapBoth(FN.constant));

export const eq: EQ.Eq<Grid> = AR.getEq(row.eq),
  show: SH.Show<Grid> = {
    show: g => {
      const size = measure(g),
        area = SZ.area(size),
        { width, height } = size,
        someCount = FN.pipe(
          g,
          mapCells(matchCell(k0, k1, k1, k1)),
          AR.map(sum),
          sum,
        ),
        full = area === 0 ? '0' : Math.round((100 * someCount) / area);

      return `${width}ˣ${height} ${full}%`;
    },
  };

export const getMonoid: Unary<BlendMode, MO.Monoid<Grid>> = blend => ({
  empty,
  concat: FN.pipe(blend, stack, FN.untupled),
});

export const [monoid, underMonoid]: Pair<MO.Monoid<Grid>> = FN.pipe(
  ['over', 'under'],
  mapBoth(getMonoid),
);

export const getArb: Unary<number, fc.Arbitrary<Grid>> = maxRowWidth =>
  fc.array(fc.nat(maxRowWidth).chain(row.getNarrowOrNoneArb), {
    minLength: 1,
    maxLength: maxRowWidth,
  });

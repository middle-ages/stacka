import {
  array as AR,
  eq as EQ,
  function as FN,
  monoid as MO,
  show as SH,
} from 'fp-ts';
import { sum } from 'fp-ts-std/Array';
import { toSnd } from 'fp-ts-std/Tuple';
import { align } from 'src/align';
import { matchCell } from 'src/cell';
import { BlendMode } from 'src/color';
import { size as SZ } from 'src/geometry';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import * as ST from './stack';
import * as TY from './types';
import { Grid } from './types';

export const eq: EQ.Eq<Grid> = {
  equals: ({ buffer: fst }, { buffer: snd }) => {
    const [fstLen, sndLen] = [fst.length, snd.length];

    if (fstLen !== sndLen) return false;

    for (let offset = 0; offset < fstLen; offset++)
      if (fst[offset] !== snd[offset]) return false;

    return true;
  },
};

export const show: SH.Show<Grid> = {
  show: grid => {
    const [{ width, height }, area] = FN.pipe(grid, TY.size, toSnd(SZ.area));
    const percent =
      area === 0
        ? 0
        : 100 *
          (FN.pipe(
            grid,
            TY.unpack,
            AR.map(AR.map(matchCell(0, FN.constant(1), FN.constant(1), 1))),
            AR.map(sum),
            sum,
          ) /
            area);
    return `${width}ˣ${height} ${percent.toFixed(0)}% non-empty`;
  },
};

export const getMonoid: Unary<BlendMode, MO.Monoid<Grid>> = mode => ({
  empty: TY.empty(),
  concat: (lower, upper) =>
    ST.stackAlign([align.bottomLeft, TY.size(lower)])(mode)([lower, upper]),
});

export const [underMonoid, overMonoid]: Pair<MO.Monoid<Grid>> = [
  getMonoid('under'),
  getMonoid('over'),
];

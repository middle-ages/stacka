import {
  array as AR,
  eq as EQ,
  monoid as MO,
  show as SH,
  string as STR,
} from 'fp-ts';
import { BlendMode } from 'src/color';
import { Unary } from 'util/function';
import * as ST from 'src/style';
import * as BU from './build';
import * as PA from './packed';
import { stackPacked } from './stack';
import * as TY from './types';
import { Cell } from './types';

export const eq: EQ.Eq<Cell> = EQ.tuple(ST.eq, STR.Eq, STR.Eq);

export const show: SH.Show<Cell> = {
  show: TY.matchCell(
    'none',
    ([style, char]) => `char: “${char}” ${ST.show.show(style)}`,
    ([style, char]) => `wide: “${char}” ${ST.show.show(style)}`,
    'cont',
  ),
};

export const getMonoid: Unary<BlendMode, MO.Monoid<Cell[]>> = mode => ({
  empty: [BU.none],
  concat: (lower, upper) =>
    AR.map(PA.unpackCell)(
      stackPacked(mode)([
        AR.map(PA.packCell)(lower),
        AR.map(PA.packCell)(upper),
      ]),
    ),
});

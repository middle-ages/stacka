import {
  eq as EQ,
  function as FN,
  monoid as MO,
  number as NU,
  show as SH,
} from 'fp-ts';
import * as LE from 'monocle-ts/Lens';
import { ModLens, modLens } from 'util/lens';
import { Unary } from 'util/function';
import { Pair, Tuple4 } from 'util/tuple';
import { Dir } from './dir';

export type Spacing = Record<Dir, number>;

export const build = (
    top: number,
    right: number,
    bottom: number,
    left: number,
  ) => ({
    top,
    right,
    bottom,
    left,
  }),
  tupled = FN.tupled(build),
  rect: Unary<Pair<number>, Spacing> = ([h, v]) => build(v, h, v, h),
  square: Unary<number, Spacing> = n => rect([n, n]),
  fromTop: Unary<number, Spacing> = n => build(n, 0, 0, 0),
  fromRight: Unary<number, Spacing> = n => build(0, n, 0, 0),
  fromLeft: Unary<number, Spacing> = n => build(0, 0, n, 0),
  fromBottom: Unary<number, Spacing> = n => build(0, 0, 0, n),
  empty = build(0, 0, 0, 0);

const [nm, ne] = [NU.MonoidSum, NU.Eq];

export const monoid: MO.Monoid<Spacing> = MO.struct({
  top: nm,
  right: nm,
  bottom: nm,
  left: nm,
});

export const eq: EQ.Eq<Spacing> = EQ.struct({
  top: ne,
  right: ne,
  bottom: ne,
  left: ne,
});

export const show: SH.Show<Spacing> = {
  show: ({ top, right, bottom, left }) => `“${top}.${right}.${bottom}.${left}”`,
};

const lens = LE.id<Spacing>();

export const [top, right, bottom, left]: Tuple4<ModLens<Spacing, number>> = [
  FN.pipe(lens, LE.prop('top'), modLens),
  FN.pipe(lens, LE.prop('right'), modLens),
  FN.pipe(lens, LE.prop('bottom'), modLens),
  FN.pipe(lens, LE.prop('left'), modLens),
];

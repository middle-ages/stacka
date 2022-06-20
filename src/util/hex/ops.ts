import { option as OP, array as AR, function as FN } from 'fp-ts';
import { test } from 'fp-ts-std/String';
import { emptyJoin } from 'util/array';
import { leftTupleWith, Tuple3 } from 'util/tuple';
import { HexColor, hexColorTag, HexRgbOf } from './types';
import { Unary } from 'util/function';
import { hex as hexConvert } from 'color-convert';
import { pluck } from '../object';

/**
 * Hex RGB 3/6 digit type guard.
 *
 * ```ts
 * hexRgb('000000'); // ok
 * hexRgb('f05'); // ok
 *
 * hexRgb('00000');  // compile-time error
 * hexRgb('00000X'); // compile-time error
 * ```
 */
export const hexRgb = <S extends string>(s: HexRgbOf<S>) => s;

const normalizeHexRgb = <S extends string>(s: S) => {
  if (s.length === 7) return s;
  const chars = s.replace(/^#/, '').split('');
  return FN.pipe(chars, AR.chain(leftTupleWith('0')), emptyJoin) as S;
};

export const isHexRgb = <S extends string>(
  s: S | HexRgbOf<S>,
): s is HexRgbOf<S> =>
  FN.pipe(s as string, normalizeHexRgb, test(/^#[0-9a-f]{6}$/));

const unsafeBuild: Unary<string, HexColor> = s => ({
  ...hexColorTag,
  value: s as string,
});

export const hexColor = <S extends string>(s: HexRgbOf<S>): HexColor =>
  unsafeBuild(s as string);

export const hex = hexColor;

export const parseHexColor: Unary<string, OP.Option<HexColor>> = FN.flow(
  OP.fromPredicate(isHexRgb),
  OP.map(unsafeBuild),
);

export const hexToRgb: Unary<HexColor, Tuple3<number>> = FN.flow(
  pluck('value'),
  normalizeHexRgb,
  hexConvert.rgb,
);

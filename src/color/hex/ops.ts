import { array as AR, function as FN, nonEmptyArray as NEA } from 'fp-ts';
import { test } from 'fp-ts-std/String';
import { Tuple4 } from 'util/tuple';
import { Unary } from 'util/function';
import {
  Hex,
  HexOf,
  hexValueTag,
  ValidHex,
  ValidHexRgb,
  ValidHexRgba,
} from './types';

export const isHex = <S extends string>(
  s: S | ValidHex<S>,
  n: number,
): s is ValidHex<S> => test(new RegExp(`^#[0-9a-f]{${n}}`))(s);

export const isHexN =
  <N extends number>(n: N) =>
  <S extends string>(s: S | HexOf<S, N>): s is HexOf<S, N> =>
    isHex(s as string, n) && (s as string).length === n + 1;

export const [isHex2, isHex3, isHex4, isHex6, isHex8] = [
  isHexN(2),
  isHexN(3),
  isHexN(4),
  isHexN(6),
  isHexN(8),
];

const unsafeHex: Unary<string, Hex> = s => ({
  ...hexValueTag,
  value: s as string,
});

export const hex = <S extends string>(s: ValidHex<S>): Hex => unsafeHex(s);

const toHex = (raw: NEA.NonEmptyArray<string>): number =>
  Number.parseInt([...raw, ...(raw.length === 1 ? raw : [])].join(''), 16);

export const hexaValueToRgba = <S extends string>(
  c: ValidHexRgba<S>,
): Tuple4<number> => {
  const raw = c.replace(/^#/, ''),
    slice = raw.length / 4;

  const [r, g, b, a] = FN.pipe(
    Array.from(raw),
    AR.chunksOf(slice),
    AR.map(toHex),
  ) as Tuple4<number>;

  return [r, g, b, a / 255];
};

export const hexValueToRgba = <S extends string>(
  c: ValidHexRgb<S>,
): [number, number, number, number] => {
  const alpha = isHex3(c) ? 'f' : 'ff';
  return hexaValueToRgba((c + alpha) as ValidHexRgba<`${S}${typeof alpha}`>);
};

export const hexToRgba = ({ value }: Hex) =>
  isHex3(value) || isHex6(value)
    ? hexValueToRgba(value)
    : isHex4(value) || isHex8(value)
    ? hexaValueToRgba(value)
    : [0, 0, 0, 0];

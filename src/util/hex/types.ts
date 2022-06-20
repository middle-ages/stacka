import { function as FN, readonlyArray as RA } from 'fp-ts';
import { N, S } from 'ts-toolbelt';
import { typedFromEntries } from '../object';
import { leftTupleWith } from '../tuple';

export const hexDigits = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
] as const;

export const hexDigitMap: Record<HexDigit, true> = FN.pipe(
  hexDigits,
  RA.map(leftTupleWith(true as const)),
  typedFromEntries,
);

export type Inc<C extends number> = N.Add<C, 1>;
export type HexDigits = typeof hexDigits;

export type HexDigit = HexDigits[number];
export const isHexDigit = (s: string): s is HexDigit => s in hexDigitMap;

export type HexError<S extends string, M extends string> = {
  error: `'Hex error: ${S} is not in hexadecimal #RGB or #RRGGBB form: ${M}`;
};

export type HexRgbStep<
  U extends string,
  H extends string,
  C extends number,
> = U extends ''
  ? C extends 6
    ? `#${H}`
    : C extends 3
    ? `#${H}`
    : HexError<H, `hex=+, #digits=${C} #digits&!=3 and digits!=6`>
  : U extends `${HexDigit}${infer R}`
  ? U extends `${infer M}${R}`
    ? HexRgbStep<R, `${H}${M}`, N.Add<C, 1>>
    : HexError<U, `could not infer head, tail='${R}'`>
  : U extends `${infer E}`
  ? HexError<
      U,
      `hex=?: unrecognized character '${S.At<E, 0>}', parsed: '${H}' (${C})`
    >
  : HexError<H, `Unknown error, unparsed='${U} (${C})'`>;

export type HexRgbOf<S extends string> = S extends `#${infer R}`
  ? S & HexRgbStep<R, '', 0>
  : HexError<S, `missing hex rgb prefix '#'`>;

export const hexColorTag = {
  _tag: 'hexColor',
} as const;

export type HexColor = typeof hexColorTag & { value: string };

export const hasHexColorTag = <T extends {}>(s: T | HexColor): s is HexColor =>
  '_tag' in s && s._tag === 'hexColor';

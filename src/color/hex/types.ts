import { function as FN, readonlyArray as RA } from 'fp-ts';
import { withSnd } from 'fp-ts-std/Tuple';
import { N, S } from 'ts-toolbelt';
import { typedFromEntries } from 'util/object';

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
  RA.map(withSnd(true as const)),
  typedFromEntries,
);

export type Inc<C extends number> = N.Add<C, 1>;

export type HexDigit = typeof hexDigits[number];

export const isHexDigit = (s: string): s is HexDigit => s in hexDigitMap;

export const hexValueTag = {
  _tag: 'hexValue',
} as const;

export type Hex = typeof hexValueTag & { value: string };

export const hasHexValueTag = <T extends {}>(s: T | Hex): s is Hex =>
  '_tag' in s && s._tag === 'hexValue';

type HexError<S extends string, M extends string, N extends number> = {
  error: `Hex error: ${S} is not in #hex${N} form: ${M}`;
};

/**
 * Type parameters:
 *
 * 1. **U** - todo of characters still unchecked
 * 1. **H** - characters from `U` checked to be OK
 * 1. **C** - counter for current char being checked, 0 means 1st character
 * 1. **N** - number of character allowed in the hex string we want to reach
 */
type HexStep<
  U extends string,
  H extends string,
  C extends number,
  N extends number,
> = U extends ''
  ? C extends N
    ? `#${H}`
    : HexError<H, `hex=+, #digits=${C} : #digits!=${N}`, N>
  : U extends `${HexDigit}${infer R}`
  ? U extends `${infer M}${R}`
    ? HexStep<R, `${H}${M}`, N.Add<C, 1>, N>
    : HexError<U, `could not infer head, tail='${R}'`, N>
  : U extends `${infer E}`
  ? HexError<
      U,
      `hex=?: unrecognized character '${S.At<E, 0>}', parsed: '${H}' (${C})`,
      N
    >
  : HexError<H, `Unknown error, unparsed='${U} (${C})'`, N>;

/**
 * An N Digit hexadecimal literal string type.
 *
 * Will catch at compile time any incorrect hex strings.
 *
 * ```ts
 * // a literal hex type 3 characters long
 * type MyHex<S extends string> = HexOf<S, 3>;
 *
 * // Correct value, a string type
 * type goodHexValue = MyHex<'#123'>;
 *
 * // All these are error types as Record<'error', string>
 * type notEnoughDigitsError   = MyHex<'#ff'>;
 * type tooManyDigitsError     = MyHex<'#1234'>;
 * type noHashPrefixFoundError = MyHex<'fff'>;
 * type unrecognizedCharError  = MyHex<'#ffX'>;
 * ```
 */
export type HexOf<S extends string, N extends number> = S extends `#${infer R}`
  ? S & HexStep<R, '', 0, N>
  : HexError<S, `missing hex rgba prefix '#'`, N>;

export type ValidHex2<S extends string> = HexOf<S, 2> & string;
export type ValidHex3<S extends string> = HexOf<S, 3> & string;
export type ValidHex4<S extends string> = HexOf<S, 4> & string;
export type ValidHex6<S extends string> = HexOf<S, 6> & string;
export type ValidHex8<S extends string> = HexOf<S, 8> & string;

export type ValidHex<S extends string> =
  | ValidHex3<S>
  | ValidHex4<S>
  | ValidHex6<S>
  | ValidHex8<S>;

export type ValidHexRgb<S extends string> = ValidHex3<S> | ValidHex6<S>;
export type ValidHexRgba<S extends string> = ValidHex4<S> | ValidHex8<S>;

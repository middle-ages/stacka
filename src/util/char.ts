import { unstyle as ansiUnstyle } from 'ansi-colors';
import ansiRegex from 'ansi-regex';
import {
  readonlyArray as RA,
  string as STR,
  array as AR,
  function as FN,
} from 'fp-ts';
import { Unary } from 'util/function';
import { Pair, tupleWith } from 'util/tuple';

import { Endo } from 'util/function';
import { emptyJoin, removeRo } from './array';
import { around, toChars } from './string';
import { BinaryC } from './function/types';

export const [okSym, koSym] = ['✔️', '❌'] as const,
  prependOkIf: BinaryC<string, boolean, string> = s => flag =>
    (flag ? okSym : koSym) + ` ${s}`;

export const [unstyle, unstyleLines]: [Endo<string>, Endo<string[]>] = [
  ansiUnstyle,
  AR.map(ansiUnstyle),
];

const ansiRe = new RegExp(FN.pipe(ansiRegex().source, around('(', ')')));

/**
 * Splits ANSI string into a list of consecutive control/text sequence pairs.
 *
 * The 1st string in the pair is the control string, the 2nd is the text.
 *
 * Example: `A[red][blue]B[green]C[yellow]` would be split into:
 * `[ ['', 'A'], ['[red][blue]', 'B'], ['[green]', 'C'], ['[yellow]', '']`.
 */
export const splitAnsiPairs = FN.flow(
  STR.split(ansiRe),
  RA.prepend(''),
  RA.chunksOf(2),
);

export type StylePair = Pair<string>; // style, char or string
export type StyledChars = Pair<string>[]; // string styled pairs

/**
 * Same as `splitAnsiPairs`, except for the 2nd element in the tuples returned.
 *
 * Here we split so that the 2nd element is always one visual character wide.
 *
 * We do _not_ repeat the control characters, so they will appear only for the
 * 1st character in a colored string.
 *
 */
export const splitAnsiChars: Unary<string, StyledChars> = FN.flow(
  splitAnsiPairs,
  removeRo,
  AR.map(([style, text]) => FN.pipe(text, toChars, AR.map(tupleWith(style)))),
  AR.flatten,
);

/** Opposite of `splitAnsiChars` */
export const joinAnsiChars: Unary<StyledChars, string> = FN.flow(
  AR.map(([char, style]) => style + char),
  emptyJoin,
);

import { array as AR, function as FN, predicate as PRE } from 'fp-ts';
import { charCriteria } from './types';
import { Unary } from 'util/function';
import { split } from 'util/string';
import { Pair } from 'util/tuple';

export const defineChains = (lines: string[]): string[][] =>
  FN.pipe(
    lines,
    FN.pipe(/,/, split, AR.chain),
    AR.map(s => Array.from(s)),
  );

export const definePairs = (lines: string[]) =>
  defineChains(lines) as Pair<string>[];

export const isOneOf: Unary<string[], PRE.Predicate<Pair<string>>> =
  pairs =>
  ([fst, snd]) =>
    pairs.includes(fst + snd);

const codePoint: Unary<string, number> = c => c.codePointAt(0) ?? 0;

export const nextCodePointEq = charCriteria(
  ([fst, snd]) => codePoint(fst) + 1 === codePoint(snd),
);

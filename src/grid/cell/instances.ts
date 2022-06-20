import * as fc from 'fast-check';
import { array as AR, eq as EQ, function as FN, show as SH } from 'fp-ts';
import { uncurry2 } from 'fp-ts-std/Function';
import { style as ST, Style } from '../style/style';
import { empty, narrow, wide } from './build';
import {
  Cell,
  Char,
  isChar,
  isCont,
  isNone,
  isWide,
  matchCell,
  Styled,
} from './types';

const styledEq = (char: string, style: Style, snd: Styled) =>
  char === snd.char && ST.eq.equals(style, snd.style);

export const eq: EQ.Eq<Cell> = {
  equals: (fst, snd) =>
    FN.pipe(
      fst,
      matchCell(
        () => isNone(snd),
        ([char, style]) => isChar(snd) && styledEq(char, style, snd),
        ([char, style]) => isWide(snd) && styledEq(char, style, snd),
        idx => isCont(snd) && snd.idx === idx,
      ),
    ),
};

export const show: SH.Show<Cell> = {
  show: matchCell(
    () => 'none',
    ([char, style]) => `char: “${char}”, ${ST.show.show(style)}`,
    ([char, style], width) =>
      `wide: “${char}”:${width}, ${ST.show.show(style)}`,
    idx => `cont #${idx}`,
  ),
};

const wideEmoji = fc.oneof(...FN.pipe(['🙂', '😢'], AR.map(fc.constant)));

export const narrowArb: fc.Arbitrary<Char> = fc
  .tuple(ST.arb, fc.char())
  .map(uncurry2(narrow));

export const narrowOrNoneArb: fc.Arbitrary<Cell> = fc.oneof(
  fc.constant(empty),
  narrowArb,
);

export const arb: fc.Arbitrary<Cell[]> = fc.oneof(
  narrowOrNoneArb.map(AR.of),
  fc.tuple(ST.arb, wideEmoji).map(uncurry2(wide)),
);

import { function as FN } from 'fp-ts';
import { Color } from 'src/color';
import stringWidth from 'string-width';
import { BinaryC, Unary } from 'util/function';
import { Pair, Tuple3 } from 'util/tuple';
import * as ST from '../style';
import { Style } from '../style';
import { Cell } from './types';

export const [none, cont]: Pair<Cell> = [
  [ST.empty, '', 'none'],
  [ST.empty, '', 'cont'],
];

export const narrow: Unary<[Style, string], Cell> = ([style, char]) => [
  style,
  char,
  'char',
];

export const wide: Unary<[Style, string], Cell[]> = ([style, char]) => [
  [style, char, 'wide'],
  cont,
];

export const build: BinaryC<Style, string, Cell[]> = style => char =>
  char === '' || (char === ' ' && ST.isEmpty(style))
    ? [none]
    : stringWidth(char) === 1
    ? [narrow([style, char])]
    : wide([style, char]);

export const [spaceBg, solidFg]: Pair<Unary<Color, Cell>> = [
  c => narrow([ST.fromBg(c), ' ']),
  c => narrow([ST.fromFg(c), '█']),
];

export const [fgChar, bgChar]: Pair<BinaryC<Color, string, Cell[]>> = [
  FN.flow(ST.fromFg, build),
  FN.flow(ST.fromBg, build),
];

export const colored: BinaryC<Pair<Color>, string, Cell[]> = FN.flow(
  ST.colored,
  build,
);

export const [bold, italic, underline]: Tuple3<Unary<string, Cell[]>> = [
  FN.pipe(ST.empty, ST.bold, build),
  FN.pipe(ST.empty, ST.italic, build),
  FN.pipe(ST.empty, ST.underline, build),
];

export const [plainChar, plainWide]: [
  Unary<string, Cell>,
  Unary<string, Cell[]>,
] = [s => narrow([ST.empty, s]), s => wide([ST.empty, s])];

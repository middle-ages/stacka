import { AnserJsonEntry, ansiToJson } from 'anser';
import assert from 'assert';
import { array as AR, function as FN } from 'fp-ts';
import { flip } from 'fp-ts-std/Function';
import { dup, toSnd } from 'fp-ts-std/Tuple';
import { Color } from 'src/color';
import { mapRange } from 'util/array';
import { Pair } from 'util/tuple';
import stringWidth from 'string-width';
import { BinaryC, Unary } from 'util/function';
import { pluck } from 'util/object';
import { style as ST, Style } from '../style/style';
import { Cell, Char, Cont, None, Wide } from './types';
import { bitmap } from 'src/bitmap';

export const fromChar: BinaryC<Style, string, Cell[]> = style => char =>
  FN.pipe(
    char,
    stringWidth(char) === 1 ? FN.flow(narrow(style), AR.of) : wide(style),
  );

export const narrow: BinaryC<Style, string, Char> = style => char => {
  assert(
    stringWidth(char) === 1,
    `narrow cell is not, got “${char}” (${stringWidth(char)})`,
  );
  return {
    _tag: 'char',
    char,
    style,
    width: 1,
  };
};

export const empty: None = { _tag: 'none', width: 1 },
  cont: Unary<number, Cont> = idx => ({ _tag: 'cont', idx, width: 1 });

export const attachCont: Unary<Wide, Cell[]> = headCell => {
  return [headCell, ...FN.pipe([1, headCell.width - 1], mapRange(cont))];
};

export const wide: BinaryC<Style, string, Cell[]> = style => char => {
  const width = stringWidth(char);
  assert(stringWidth(char) > 1, 'wide cell is not');
  return attachCont({ _tag: 'wide', char, style, width });
};

export const fgChar: BinaryC<string, Color, Cell> = s => c =>
    FN.pipe(s, FN.pipe(c, ST.fromFg, narrow)),
  colored: BinaryC<string, Pair<Color>, Cell> = s =>
    FN.flow(ST.colored, FN.pipe(s, flip(narrow))),
  bgChar: BinaryC<string, Color, Cell> = s => FN.flow(dup, colored(s));

export const bgSpace: Unary<Color, Cell> = bgChar(bitmap.space),
  solidFg: Unary<Color, Cell> = fgChar(bitmap.solid);

export const plainNarrow: Unary<string, Char> = narrow(ST.empty),
  plainWide: Unary<string, Cell[]> = wide(ST.empty);

const split: Unary<string, string[]> = s =>
  Array.from(
    new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(s),
    pluck('segment'),
  );

const parseEntry: Unary<AnserJsonEntry, Cell[]> = entry => {
  const { content, isEmpty } = entry;
  if (isEmpty()) return [];

  const style = ST.fromParsed(entry);

  return FN.pipe(
    content,
    split,
    FN.pipe(stringWidth, toSnd, AR.map),
    AR.chain(([s, width]) =>
      FN.pipe(s, width === 1 ? FN.flow(narrow(style), AR.of) : wide(style)),
    ),
  );
};

export const parseRow: Unary<string, Cell[]> = FN.flow(
  ansiToJson,
  AR.chain(parseEntry),
);

export const parseRows: Unary<string[], Cell[][]> = AR.map(parseRow);

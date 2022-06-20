import {
  array as AR,
  function as FN,
  predicate as PRE,
  string as STR,
} from 'fp-ts';
import { transpose } from 'fp-ts-std/Array';
import { emptyJoin, init } from 'util/array';
import { Unary } from 'util/function';
import { chopHead, chopLast, lines, toChars } from 'util/string';
import { Pair } from 'util/tuple';
import { RowList } from '../../types';
import { columnsPerCell } from './basicBorderSets';
import { Glyph, Mat } from './types';

const nonEmpty = AR.filter(PRE.not(STR.isEmpty));

const parseHeader = (s: string) => s.trim().split(/\s+/) as Pair<string>;

const parseCell = ([header, , ...rest]: RowList): Glyph => {
  const [, char] = parseHeader(header),
    display = init(rest) as Mat;
  return { key: emptyJoin(display), display, char };
};

export const parseBitmap: Unary<string, Glyph[]> = FN.flow(
  lines,
  nonEmpty,
  AR.map(chopLast),
  AR.map(
    FN.flow(
      toChars,
      AR.chunksOf(columnsPerCell),
      AR.map(FN.flow(emptyJoin, chopHead)),
    ),
  ),
  transpose,
  AR.map(parseCell),
);

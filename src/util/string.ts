import {
  array as AR,
  either as EI,
  function as FN,
  option as OP,
  readonlyArray as RA,
  string as STR,
} from 'fp-ts';
import { curry2, uncurry2 } from 'fp-ts-std/Function';
import { join } from 'fp-ts-std/ReadonlyArray';
import { append, prepend, unlines } from 'fp-ts-std/String';
import { Predicate } from 'fp-ts/lib/Predicate';
import stringWidth from 'string-width';
import { defined } from 'util/any';
import { headTail, initLast, withHead } from 'util/array';
import { Binary, BinaryC, BinOpC, Endo, Unary, λk } from 'util/function';
import { Pair, pairMap } from 'util/tuple';

export type Char = string;
export type Row = string;

export type MaybeChar = OP.Option<Char>;
export type MaybeRow = OP.Option<Row>;

/** fp-ts does not allow split unless non-empty */
export const split =
  (re: RegExp): Unary<string, string[]> =>
  s =>
    s.split(re);

export const toChars = split(new RegExp(''));
export const spaced = (s: string[]) => s.join(' ');
export const commified = (s: string[]) => s.join(', ');
export const stringEq: Unary<string, Predicate<string>> = curry2(STR.Eq.equals);
export const isWord: Predicate<string> = s => s.match(/^\w+$/) !== null;

export const stringHead: Endo<string> = s => s.substring(0, 1),
  chopHead: Endo<string> = s => s.substring(1),
  chopLast: Endo<string> = s => s.substring(0, stringWidth(s) - 1),
  chopBoth: Endo<string> = FN.flow(chopHead, chopLast);

export const plural: Unary<number, Endo<string>> = n =>
  n === 1 ? FN.identity : append('s');

export const ucFirst: Endo<string> = s =>
  s.charAt(0).toUpperCase() + s.slice(1);

export const around: Binary<string, string, Endo<string>> =
  (left, right) => s =>
    `${left}${s}${right}`;

export const [orEmpty, orSpace]: Pair<Unary<MaybeChar, string>> = FN.pipe(
  ['', ' '],
  pairMap(FN.flow(λk, OP.getOrElse)),
);

export const maybeSurround: Unary<
  Pair<OP.Option<string>>,
  Endo<string>
> = FN.flow(pairMap(orEmpty), FN.tupled(around));

export const quoteRe: Endo<string> = FN.flow(
  split(new RegExp('')),
  FN.pipe('\\', prepend, RA.map),
  join(''),
);

export const nChars: BinaryC<string, number, string> = c => n =>
    RA.replicate(n, c).join(''),
  nSpaces: Unary<number, string> = nChars(' '),
  nLines: Unary<number, string[]> = n => [...RA.replicate(n, '')];

export const indent: BinaryC<number, string[], string[]> = FN.flow(
  nSpaces,
  prepend,
  AR.map,
);

export const indentString: BinaryC<number, string, string> = n => s =>
  FN.pipe(s, lines, FN.pipe(n, nSpaces, prepend, AR.map), unlines);

export const splitHead: BinaryC<
  string,
  string,
  EI.Either<string, Pair<string>>
> = reString => s => {
  const re = new RegExp(`^(${reString})(.*)`, 's'),
    res = s.match(re);
  return res === null ? EI.left(s) : EI.right([res[1], res[2]] as Pair<string>);
};

export const matchAny: Unary<RegExp[], Predicate<string>> = res => s => {
  let found = false;
  for (const re of res) {
    if (s.match(re)) {
      found = true;
      break;
    }
  }
  return found;
};

export const prependHead: BinOpC<string> = prefix =>
  FN.flow(lines, withHead(prepend(prefix)), unlines);

export const prependHeadTail: Unary<Pair<string>, Endo<string[]>> =
  ([headPrefix, tailPrefix]) =>
  rows => {
    if (rows.length < 2) return [FN.pipe(rows[0], prepend(headPrefix))];

    const [head, tail] = headTail(rows);
    return [
      FN.pipe(head, prepend(headPrefix)),
      ...FN.pipe(tail, FN.pipe(tailPrefix, prepend, AR.map)),
    ];
  };

export const prependInitLast: BinaryC<string, string, Endo<string[]>> =
  initPrefix => lastPrefix => rows => {
    if (rows.length < 2) return [FN.pipe(rows[0], prepend(lastPrefix))];

    const [init, last] = initLast(rows);
    return [
      ...FN.pipe(init, FN.pipe(initPrefix, prepend, AR.map)),
      FN.pipe(last, prepend(lastPrefix)),
    ];
  };

/** Zip and concat a row pair */
export const zipRows: BinOpC<string[]> = left => right =>
  FN.pipe(right, AR.zip(left), FN.pipe(append, uncurry2, AR.map));

export const zipReduceRows = (rowGroups: string[][]): string[] =>
  rowGroups.reduce((acc, cur) => FN.pipe(cur, zipRows(acc)));

export const lowerCamelCase = (s: string): string => {
  if (s === s.toUpperCase()) return s.toLowerCase();
  const head = s.at(0);
  return defined(head) ? head.toLowerCase() + s.substring(1) : '';
};

/**
 * Upper-camel-case a string. If string is all lower-cased and is
 * equal to the given `acronym` param, it will be all-upper-cased
 */
export const upperCamelCase = (s: string, acronym = ''): string => {
  if (s === s.toLowerCase() && s === acronym) return s.toUpperCase();
  const head = s.at(0);
  return defined(head) ? head.toUpperCase() + s.substring(1) : '';
};

export const lines = (s: string) => s.split('\n');

/** replicate a MaybeChar N times, or return N spaces if it is none */
export const replicateOrSpace: BinaryC<
  OP.Option<string>,
  number,
  string
> = FN.flow(orSpace, nChars);

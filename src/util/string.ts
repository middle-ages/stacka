import {
  array as AR,
  function as FN,
  readonlyArray as RA,
  string as STR,
} from 'fp-ts';
import { curry2, uncurry2 } from 'fp-ts-std/Function';
import {
  append,
  lines as splitLines,
  prepend,
  unlines,
} from 'fp-ts-std/String';
import { Predicate } from 'fp-ts/lib/Predicate';
import { headTail, initLast, withHead } from 'util/array';
import { Binary, BinaryC, BinOpC, Endo, Unary } from 'util/function';
import { Pair } from 'util/tuple';

export const split =
    (re: RegExp): Unary<string, string[]> =>
    s =>
      s.split(re),
  stringEq: Unary<string, Predicate<string>> = curry2(STR.Eq.equals),
  ucFirst: Endo<string> = s => s.charAt(0).toUpperCase() + s.slice(1),
  lines: Unary<string, string[]> = s =>
    splitLines(s) as readonly string[] as string[];

export const around: Binary<string, string, Endo<string>> =
  (left, right) => s =>
    `${left}${s}${right}`;

export const nChars: BinaryC<string, number, string> = c => n =>
    RA.replicate(n, c).join(''),
  nSpaces: Unary<number, string> = nChars(' ');

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

/** Uses `zip` to reduce a list-of-list of strings into a list of strings */
export const zipReduceRows = ([head, ...columns]: string[][]): string[] =>
  FN.pipe(
    columns,
    AR.reduce(head, (acc, cur) => FN.pipe(cur, zipRows(acc))),
  );

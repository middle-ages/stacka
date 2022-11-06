import {
  array as AR,
  function as FN,
  readonlyArray as RA,
  string as STR,
} from 'fp-ts';
import { curry2 } from 'fp-ts-std/Function';
import { lines as splitLines, prepend } from 'fp-ts-std/String';
import { Predicate } from 'fp-ts/lib/Predicate';
import { initLast } from 'util/array';
import { Binary, BinaryC, Endo, Unary } from 'util/function';

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

export const prependInitLast: BinaryC<string, string, Endo<string[]>> =
  initPrefix => lastPrefix => rows => {
    if (rows.length < 2) return [FN.pipe(rows[0], prepend(lastPrefix))];

    const [init, last] = initLast(rows);
    return [
      ...FN.pipe(init, FN.pipe(initPrefix, prepend, AR.map)),
      FN.pipe(last, prepend(lastPrefix)),
    ];
  };

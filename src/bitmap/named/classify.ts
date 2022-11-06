import { function as FN, predicate as PRE, option as OP } from 'fp-ts';
import { Unary } from 'util/function';
import { line } from './line';
import { solid as solidChar, space as spaceChar } from './other';
import { LineGroup } from './types';

const [lineH, lineV, thickH, thickV, nearH, nearV, halfSolidH, halfSolidV] = [
  '─╌┄┈',

  '│╎┆┊',

  '━╍┅┉',

  '┃╏┇┋',

  '▁▔',

  '▕▏',

  '▄▀',

  '▐▌',
] as const;

export const isLineH: PRE.Predicate<string> = c => lineH.includes(c),
  isLineV: PRE.Predicate<string> = c => lineV.includes(c),
  isThickH: PRE.Predicate<string> = c => thickH.includes(c),
  isThickV: PRE.Predicate<string> = c => thickV.includes(c),
  isNearH: PRE.Predicate<string> = c => nearH.includes(c),
  isNearV: PRE.Predicate<string> = c => nearV.includes(c),
  isHalfSolidH: PRE.Predicate<string> = c => halfSolidH.includes(c),
  isHalfSolidV: PRE.Predicate<string> = c => halfSolidV.includes(c);

export const isLine = FN.pipe(isLineH, PRE.or(isLineV)),
  isThin = FN.pipe(isNearH, PRE.or(isNearV)),
  isThick = FN.pipe(isThickH, PRE.or(isThickV)),
  isHalfSolid = FN.pipe(isHalfSolidH, PRE.or(isHalfSolidV));

export const hGroup: Unary<string, OP.Option<LineGroup>> = s =>
  s === spaceChar
    ? OP.some('space')
    : s === solidChar
    ? OP.some('solid')
    : s === line.double.horizontal
    ? OP.some('double')
    : isLineH(s)
    ? OP.some('line')
    : isThickH(s)
    ? OP.some('thick')
    : isNearH(s)
    ? OP.some('near')
    : isHalfSolidH(s)
    ? OP.some('halfSolid')
    : OP.none;

export const vGroup: Unary<string, OP.Option<LineGroup>> = s =>
  s === spaceChar
    ? OP.some('space')
    : s === solidChar
    ? OP.some('solid')
    : s === line.double.vertical
    ? OP.some('double')
    : isLineV(s)
    ? OP.some('line')
    : isThickV(s)
    ? OP.some('thick')
    : isNearV(s)
    ? OP.some('near')
    : isHalfSolidV(s)
    ? OP.some('halfSolid')
    : OP.none;

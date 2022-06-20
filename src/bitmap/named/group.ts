import { predicate as PRE } from 'fp-ts';
import { Unary } from 'util/function';
import { HCornerLine, VCornerLine } from './line';

export const [thinH, thinV, thickH, thickV] = [
  '─╌┄┈',

  '│╎┆┊',

  '━╍┅┉',

  '┃╏┇┋',
] as const;

export const isThinH: PRE.Predicate<string> = c => thinH.includes(c),
  isThinV: PRE.Predicate<string> = c => thinV.includes(c),
  isThickH: PRE.Predicate<string> = c => thickH.includes(c),
  isThickV: PRE.Predicate<string> = c => thickV.includes(c);

export const classifyVChar: Unary<string, VCornerLine> = c =>
  isThinV(c)
    ? 'line'
    : isThickV(c)
    ? 'thick'
    : c === '║'
    ? 'double'
    : (c as VCornerLine);

export const classifyHChar: Unary<string, HCornerLine> = c =>
  isThinH(c)
    ? 'line'
    : isThickH(c)
    ? 'thick'
    : c === '═'
    ? 'double'
    : (c as HCornerLine);

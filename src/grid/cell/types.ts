import { Lazy } from 'fp-ts/lib/function';
import { Binary, Ternary, Unary } from 'util/function';
import { Style } from '../style/style';

/**
 * There are three cell types:
 *
 * 1. `none` represents an empty cell
 * 2. `char` represents a character of width 1
 * 3. `wide` represents a character of width > 1
 * 4. `cont` represents a continuation of a previous wide character
 *
 */
export const cellTypes = ['none', 'char', 'wide', 'cont'] as const;

export type CellType = typeof cellTypes[number];

export interface BaseCell {
  width: number;
}

export interface Styled extends BaseCell {
  char: string;
  style: Style;
}

export interface None extends BaseCell {
  _tag: 'none';
  width: 1;
}

export interface Char extends Styled {
  _tag: 'char';
  width: 1;
}

export interface Wide extends Styled {
  _tag: 'wide';
}

export interface Cont extends BaseCell {
  _tag: 'cont';
  idx: number;
  width: 1;
}

export type Cell = None | Char | Wide | Cont;

export const isNone = (o: Cell): o is None => o._tag === 'none',
  isChar = (o: Cell): o is Char => o._tag === 'char',
  isWide = (o: Cell): o is Wide => o._tag === 'wide',
  isCont = (o: Cell): o is Cont => o._tag === 'cont',
  isSpace = (o: Cell): o is Char => isChar(o) && o.char === ' ',
  isEmpty = (o: Cell): o is Char | None => isNone(o) || isSpace(o);

export const matchCell =
  <R>(
    none: Lazy<R>,
    char: Binary<[string, Style], Char, R>,
    wide: Ternary<[string, Style], number, Wide, R>,
    cont: Binary<number, Cont, R>,
  ): Unary<Cell, R> =>
  o =>
    isNone(o)
      ? none()
      : isChar(o)
      ? char([o.char, o.style], o)
      : isWide(o)
      ? wide([o.char, o.style], o.width, o)
      : cont(o.idx, o);

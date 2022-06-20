import assert from 'assert';
import { array as AR, function as FN } from 'fp-ts';
import { BlendMode } from 'src/color';
import { glyph } from 'src/glyph';
import { initLast } from 'util/array';
import { BinOpT, Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { style as ST } from '../style/style';
import { narrow } from './build';
import { Cell, Char, isCont, isWide } from './types';

/**
 * Stack two character cells on top of each other by stacking styles and glyphs.
 *
 * 1. Styles: colors are blended and text decorations merged
 * 2. Glyphs: Glyph combination is attempted. When no combination glyph can be
 *    found, `above` wins over `below`
 *
 */
export const stackChar: Unary<BlendMode, BinOpT<Char>> =
  blend =>
  ([below, above]) =>
    blend === 'under'
      ? below
      : blend === 'over'
      ? above
      : FN.pipe(
          [below.char, above.char],
          glyph.combine,
          FN.pipe(
            [below.style, above.style],
            FN.tupled(ST.getMonoid(blend).concat),
            narrow,
          ),
        );

/*
 * Chops one character, possibly spanning several cells, from the left side of
 * the given row, returning the chopped character and remaining cells.
 *
 * If the left-most character is _not_ wide, this behaves like `shift`.
 *
 * When a wide character is returned, it is returned followed by all its `cont`
 * cells. `none` and `char` cells will always arrive as single members in this
 * array.
 *
 * Pre-conditions:
 *
 * 1. Row head cannot be a `cont` cell
 * 2. When row head is wide, row must have enough `cont` cells for it
 *
 */
export const chopCharLeft = (cells: Cell[]): Pair<Cell[]> => {
  assert(cells.length !== 0, 'chopping empty row');
  const [head, ...tail] = cells;
  if (!isWide(head)) return [[head], tail];
  const [cont, newTail] = FN.pipe(tail, AR.splitAt(head.width - 1));
  return [[head as Cell].concat(cont), newTail];
};

/** Same as `chopCharRight` but chops from the right */
export const chopCharRight = (cells: Cell[]): Pair<Cell[]> => {
  assert(cells.length !== 0, 'chopping empty row');
  const [init, last] = initLast(cells);
  if (!isCont(last)) return [[last], init];

  const [newInit, wideInit] = FN.pipe(
    init,
    AR.splitAt(init.length - last.idx)<Cell>,
  );
  return [wideInit.concat([last]), newInit];
};

/** Splits a list of cells so each chunk is one character */
export const chunkChars: Unary<Cell[], Cell[][]> = cells => {
  if (cells.length === 0) return [];
  let todo = cells;
  const acc: Cell[][] = [];
  while (todo.length > 0) {
    const [got, newTodo] = chopCharLeft(todo);
    todo = newTodo;
    acc.push(got);
  }
  return acc;
};

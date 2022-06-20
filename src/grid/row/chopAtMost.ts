import assert from 'assert';
import { BinaryC, Endo, Unary } from 'util/function';
import { delay, final, Tailcall, tco } from 'util/tco';
import { cell } from '../cell/cell';
import { Row, SplitResult } from './types';

// moves cells, if possible, from right array to left array up to delta width
const stepLeft: Tailcall<SplitResult> = state => {
  const { left, right, delta } = state;
  assert(delta >= 0, 'negative delta cannot be split left');
  if (right.length === 0) return final(state);

  const [[headChar, ...headCont], tail] = cell.chopCharLeft(right),
    newDelta = delta - headChar.width;

  return newDelta < 0
    ? final(state)
    : delay(() =>
        stepLeft({
          left: [...left, headChar, ...(cell.isWide(headChar) ? headCont : [])],
          right: tail,
          delta: newDelta,
        }),
      );
};

// moves cells, if possible, from left array to right array up to delta width
const stepRight: Tailcall<SplitResult> = state => {
  const { left, right, delta } = state;
  assert(delta >= 0, 'negative delta cannot be split right');

  if (left.length === 0) return final(state);

  const [[lastChar, ...lastCont], init] = cell.chopCharRight(left),
    newDelta = delta - lastChar.width;

  return newDelta < 0
    ? final(state)
    : delay(() =>
        stepRight({
          left: init,
          right: [lastChar, ...lastCont, ...right],
          delta: newDelta,
        }),
      );
};

/**
 * Given a width and a row of cells, splits the row at the right-most
 * position where the part left of the split is less than or equal to the given
 * max width.
 *
 * Left part is always as wide or narrower than given max width.
 *
 * Also returned is the delta, never negative, between the width of the left part
 * and the given max width.
 *
 * Each cell is 1 character wide, so we could just take the N-th items from the left,
 * where N is the required width. However this could break _wide_ characters. We
 * must make sure never to split the cells of a wide character between the
 * two parts.
 *
 * When wide characters are split to the left, they are returned together with
 * their continuation cells.
 *
 */
export const chopAtMostLeft: BinaryC<number, Row, SplitResult> =
  maxWidth => row =>
    tco(stepLeft({ left: [], right: row, delta: maxWidth }));

/** Same as `chopAtMostLeft` but splits from the right of the row  */
export const chopAtMostRight: BinaryC<number, Row, SplitResult> =
  maxWidth => row =>
    tco(stepRight({ left: row, right: [], delta: maxWidth }));

export const dropAtMostLeft: Unary<number, Endo<Row>> = maxWidth => row =>
  chopAtMostLeft(maxWidth)(row).right;

export const dropAtMostRight: Unary<number, Endo<Row>> = maxWidth => row =>
  chopAtMostRight(maxWidth)(row).left;

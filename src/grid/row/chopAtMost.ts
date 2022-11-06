import { BinaryC, Endo, Unary } from 'util/function';
import { cell } from '../cell/cell';
import { Row, SplitResult } from './types';

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
 */
export const chopAtMostLeft: BinaryC<number, Row, SplitResult> =
  maxWidth => row => {
    let right = row,
      delta = maxWidth,
      done = false;

    const left: Row = [];

    while (!done && right.length > 0 && delta > 0) {
      const [head, tail] = cell.chopCharLeft(right),
        newDelta = delta - head[0].width;

      if (newDelta < 0) done = true;
      else {
        left.push(...head);
        right = tail;
        delta = newDelta;
        if (delta === 0) done = true;
      }
    }

    return { left, right, delta };
  };

/** Same as `chopAtMostLeft` but splits from the right of the row  */
export const chopAtMostRight: BinaryC<number, Row, SplitResult> =
  maxWidth => row => {
    let left = row,
      delta = maxWidth,
      done = false;

    const right: Row = [];

    while (!done && left.length > 0 && delta > 0) {
      const [head, tail] = cell.chopCharRight(left),
        newDelta = delta - head[0].width;

      if (newDelta < 0) done = true;
      else {
        right.unshift(...head);
        left = tail;
        delta = newDelta;
        if (delta === 0) done = true;
      }
    }

    return { left, right, delta };
  };

export const dropAtMostLeft: Unary<number, Endo<Row>> = maxWidth => row =>
  chopAtMostLeft(maxWidth)(row).right;

export const dropAtMostRight: Unary<number, Endo<Row>> = maxWidth => row =>
  chopAtMostRight(maxWidth)(row).left;

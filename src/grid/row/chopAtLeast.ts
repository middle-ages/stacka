import { function as FN } from 'fp-ts';
import { chopCharLeft, chopCharRight } from 'src/grid/cell/ops';
import { BinaryC } from 'util/function';
import { chopAtMostLeft, chopAtMostRight } from './chopAtMost';
import { Row, SplitResult } from './types';

/*
 * Given a width and a row of cells, splits the row at the left-most position
 * where the part left of the split is greater than or equal to the given max
 * width.
 *
 * ## Returns
 *
 * The left/right row splits, and the delta between requested and actual width
 * of left part.
 *
 * Left part is always as wide or wider than the requested width. This is the
 * smallest part that can be chopped from the row left, that is still at or
 * above the requested width.
 *
 * Delta returned is never positive: we never chop less than requested, though
 * we may chop more.
 *
 * ## Example
 *
 * For example consider the row where the head cell has a narrow character, and
 * the tail is all double-width characters.
 *
 * ```txt
 *
 *   column #     0        1        2        3        4        5
 *   ━━━━━━━━┳━━━━━━━━┳━━━━━━━━┳━━━━━━━━┳━━━━━━━━┳━━━━━━━━┳━━━━━━━━┳─┈
 *    char # ┃┌──────┐┃┌───────╂───────┐┃┌───────╂───────┐┃┌───────╂┈
 *    + char ┃│0. w=1│┃│1. w=2 ┃       │┃│2. w=2 ┃       │┃│3. w=2 ┃ …
 *    width  ┃└──────┘┃└───────╂───────┘┃└───────╂───────┘┃└───────╂┈
 *   ━━━━━━━━┻━━━━━━━━┻━━━━━━━━┻━━━━━━━━┻━━━━━━━━┻━━━━━━━━┻━━━━━━━━┻─┈
 * ```
 *
 * For the row shown above:
 *
 * 1. `chopAtLeastLeft(1)`: will split the row between characters `#0` and `#1`
 *    and the delta returned will be zero
 * 2. But `chopAtLeastLeft(2)`: will split the row between characters `#1` and
 *    `#2`, which turns out to be between columns `#2` and `#3`, because the
 *    wide character at char `#1` cannot be broken. The delta returned will be
 *    `1`, because while the requested width was `2`, the width of the left
 *    part we chopped is `3`
 *
 * ## Input Constraint
 *
 * Row is wider than given width so that there are always enough cells to chop
 */

export const chopAtLeastLeft: BinaryC<number, Row, SplitResult> =
  minWidth => row => {
    if (row.length === 0) return { left: [], right: row, delta: 0 };
    else if (row.length == minWidth) return { left: row, right: [], delta: 0 };

    const { left, right, delta } = FN.pipe(row, chopAtMostLeft(minWidth));

    if (delta === 0) return { left, right, delta };

    const [chopped, choppedRight] = chopCharLeft(right),
      newLeft = left.concat(chopped),
      newDelta = newLeft.length - minWidth;

    return { left: newLeft, right: choppedRight, delta: newDelta };
  };

/** Same as `chopAtLeastLeft` but counts the split from the _right_ */
export const chopAtLeastRight: BinaryC<number, Row, SplitResult> =
  minWidth => row => {
    if (row.length === 0) return { left: row, right: [], delta: 0 };
    else if (row.length == minWidth) return { left: [], right: row, delta: 0 };

    const { left, right, delta } = FN.pipe(row, chopAtMostRight(minWidth));

    if (delta === 0) return { left, right, delta };

    const [chopped, choppedLeft] = chopCharRight(left),
      newRight = chopped.concat(right),
      newDelta = newRight.length - minWidth;

    return { right: newRight, left: choppedLeft, delta: newDelta };
  };

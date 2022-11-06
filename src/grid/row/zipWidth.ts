import assert from 'assert';
import { Unary } from 'util/function';
import { Pair } from 'util/tuple';
import { chopMinLeft } from './chopMin';
import { Row } from './types';

/**
 *
 * Zip two grid rows of equal width, but instead of pairing by cells, pairs by
 * smallest indivisible _width_.
 *
 * For example consider the equal-width rows `A` and `B`, where
 * `A=xyz` and `B=X😢`. An array zip function will zip them into the
 * pairs: `[“x`”,“X”], [“y”,“😢”], [“z”,]`.
 *
 * `zipWidth` will zip them so: `[“x”,“X”], [“yz”,“😢”]`.
 *
 * Constraints on result:
 *
 * 1. `∀ pair ∈ result:` sum of cell widths is equal
 * 2. `∄ pair ∈ result:` that can be shortened without breaking wide characters
 *    while still maintaining equality, I.e. the pairs are as short as possible
 * 3. bijection between characters in arguments and results + same order, I.e.
 *    we don't lose, gain, or reorder characters
 *
 * When there are no wide characters in the row, `zipWidth` behaves like regular
 * `zip`.
 *
 * Zipping by width is useful when stacking rows on top of each other.
 *
 * ## Identity Edge Case
 *
 * Consider the case of zipping two rows composed of nothing but double width
 * characters, except the 1st that has a narrow character as its head, so that
 * they are staggered like bricks as pictured below:
 *
 * ```txt
 *
 *   column #     0        1        2       3        4
 *   ━━━━━━━━┳━━━━━━━━┳━━━━━━━━┳━━━━━━━━┳━━━━━━━━┳━━━━━━━━┳━━─┈
 *           ┃┌──────┐┃┌───────╂───────┐┃┌───────╂───────┐┃┌─
 *   1st row ┃│narrow│┃│      wide     │┃│      wide     │┃┆  …
 *           ┃└──────┘┃└───────╂───────┘┃└───────╂───────┘┃└─
 *   ━━━━━━━━╋━━━━━━━━╋━━━━━━━━╋━━━━━━━━╋━━━━━━━━╋━━━━━━━━╋━━─┈
 *           ┃┌───────╂───────┐┃┌───────╂───────┐┃┌───────╂───
 *   2nd row ┃│    wide       │┃│      wide     │┃│      wide …
 *           ┃└───────╂───────┘┃└───────╂───────┘┃└───────╂───
 *   ━━━━━━━━┻━━━━━━━━┻━━━━━━━━┻━━━━━━━━┻━━━━━━━━┻━━━━━━━━┻━━─┈
 * ```
 *
 * There are only two position where we can split the row without breaking any
 * wide characters: the 1st and last positions. In the case above, for example,
 * we return the input unchanged, making `zipWidth` behave like an identity.
 *
 */
export const zipWidth: Unary<Pair<Row>, Pair<Row>[]> = ([fst, snd]) => {
  assert(fst.length === snd.length, 'zipping unequal width');
  let fstTodo = fst,
    sndTodo = snd;

  const done: Pair<Row>[] = [];

  while (fstTodo.length > 0) {
    const [[gotFst, newFstTodo], [gotSnd, newSndTodo]] = chopMinLeft([
      fstTodo,
      sndTodo,
    ]);
    fstTodo = newFstTodo;
    sndTodo = newSndTodo;
    done.push([gotFst, gotSnd]);
  }

  return done;
};

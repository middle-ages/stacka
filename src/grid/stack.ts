import { array as AR, function as FN, predicate as PRE } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Align } from 'src/align';
import * as CE from 'src/cell';
import { PackedType } from 'src/cell';
import { BlendMode } from 'src/color';
import { Rect, Size } from 'src/geometry';
import { BinaryC, BinOpT, Unary } from 'util/function';
import { expand } from './expand';
import { resize } from './resize';
import * as TY from './types';
import { Grid } from './types';

const copyCell = (
  write: Uint32Array,
  offset: number,
  read: Uint32Array,
): number => CE.copyCell(read, write, offset, offset)[0];

const copyPair = (
  write: Uint32Array,
  offset: number,
  read: Uint32Array,
): number => CE.copyCellPair(read, write, offset, offset)[0];

const [stackNarrow, stackWide] = [CE.stackPackedNarrow, CE.stackPackedWide],
  isUnder: PRE.Predicate<BlendMode> = m =>
    m === 'under' || m === 'combineUnder',
  isNoneOrCont: PRE.Predicate<PackedType> = t => t === 0 || t === 3;

/**
 * ### Stack Equal Sized Grids
 *
 * The grids are stacked cell by cell.
 *
 * A stacking strategy will be chosen according to the cell type and blend mode.
 * The main goal is to provide sensible defaults while allowing full
 * manual override via choice of grid zOrder and blend mode.
 *
 * The strategies are:
 *
 * 1. If both cells are narrow characters, combine the glyphs and blend their
 *    styles
 * 1. If both cells are wide, select the lower if blend mode is `under` or
 *    `combineUnder`, and the upper for other blend modes
 * 1. If both cells are empty, so is their stacking
 * 1. If an empty cell is stacked with a narrow cell, the result is the narrow
 *    cell, regardless of which cell is the upper one, and regardless of the
 *    blend mode
 * 1. When stacking narrow and wide cells we select the lower cell for
 *    `under`/`combineUnder`, and the upper in all other cases. If the
 *    winner is wide, we select 2 cells so that we never break wide
 *    runes
 *
 * The choice of stack result is summarized in the table below:
 *
 * ```txt
 *
 * ───────when────────────┬────then─────────
 *                        ┆
 * lower  upper   blend   ┆   stack    skip
 * type   type    mode    ┆   result   next
 *                        ┆
 * ───────────────────────┼─────────────────
 *          0       *     ┆     ↑       ◻
 *  0|3     1       *     ┆     ↑       ◻
 *          2       *     ┆     ↑ˣ2     ◼
 * ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┼┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
 *   0              *     ┆     ↓       ◻
 *   1     0|3      *     ┆     ↓       ◻
 *   2              *     ┆     ↓ˣ2     ◼
 * ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┼┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
 *          1       *     ┆   stack     ◻
 *   1      2     under   ┆     ↓       ◻
 *          2     over    ┆     ↓ˣ2     ◼
 * ┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┼┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈
 *          2       *     ┆   stack     ◻
 *   2      1     under   ┆     ↓ˣ2     ◼
 *          1     over    ┆     ↑       ◻
 * ───────────────────────┴─────────────────
 *  Stack Result by Cell Type & Blend Mode
 *
 *
 *               Table Legend
 * ─────────────────────────────────────────
 *        ↑         copy upper cell
 *        ↓         copy lower cell
 *       ˣ2         copy 2 cells
 *
 *       type   0   an empty cell
 *       type   1   a narrow char
 *       type   2   1st cell of wide char
 *       type   3   2nd cell of wide char
 *       type 0|3   type 0 or type 3
 *
 * ```
 *
 */
export const stack: Unary<BlendMode, BinOpT<Grid>> =
  mode =>
  ([lowGrid, upGrid]) => {
    if (TY.isEmpty(upGrid)) return lowGrid;
    else if (TY.isEmpty(lowGrid)) return upGrid;

    const [{ width, buffer: low }, { buffer: up }] = [lowGrid, upGrid],
      rowWords = CE.cellWords * width,
      height = TY.countRows(lowGrid),
      { buffer: writeBuffer } = TY.sized({ width, height }),
      [readLowType, readUpType, readLow, readUp, write] = [
        CE.readPackedType(low),
        CE.readPackedType(up),
        CE.readPackedCell(low),
        CE.readPackedCell(up),
        CE.writePackedCell(writeBuffer),
      ];

    let skip = false;

    for (let y = 0; y < height; y++) {
      const rowIdx = y * rowWords;

      for (let x = 0; x < width; x++) {
        if (skip) {
          skip = false;
          continue;
        }

        const idx = rowIdx + x * CE.cellWords;

        const [lowType, upType] = [readLowType(idx), readUpType(idx)];

        if (isNoneOrCont(upType)) {
          if (lowType === 2) {
            copyPair(writeBuffer, idx, low);
            skip = true;
          } else copyCell(writeBuffer, idx, low);
          continue;
        }

        if (isNoneOrCont(lowType)) {
          if (upType === 2) {
            copyPair(writeBuffer, idx, up);
            skip = true;
          } else copyCell(writeBuffer, idx, up);
          continue;
        }

        if (lowType === 1) {
          if (upType === 1)
            write(idx, stackNarrow(mode)([readLow(idx)[1], readUp(idx)[1]]));
          else if (isUnder(mode)) copyCell(writeBuffer, idx, low);
          else {
            copyPair(writeBuffer, idx, up);
            skip = true;
          }
          continue;
        }

        if (upType === 2) {
          write(idx, stackWide(mode)([readLow(idx)[1], readUp(idx)[1]]));
          continue;
        }

        if (isUnder(mode)) {
          copyPair(writeBuffer, idx, low);
          skip = true;
        } else copyCell(writeBuffer, idx, up);
      }
    }

    return { width, buffer: writeBuffer };
  };

/** Stack a pair of arbitrary sized grid */
export const stackAlign: BinaryC<[Align, Size], BlendMode, BinOpT<Grid>> =
  ([align, size]) =>
  mode =>
  ([lower, upper]) =>
    TY.isEmpty(upper)
      ? lower
      : TY.isEmpty(lower)
      ? upper
      : FN.pipe([lower, upper], mapBoth(resize(align)(size)), stack(mode));

/**
 * Stack a list of children on top of a parent with the given size, alignment
 * and blend mode
 */
export const stackChildren =
  (
    align: Align,
    size: Size,
    mode: BlendMode,
  ): BinaryC<Grid, [Grid, Rect][], Grid> =>
  parent =>
  children => {
    if (children.length === 0) return parent;
    const stackAtMode = FN.pipe(mode, stackAlign([align, size]), FN.untupled),
      [head, ...tail] = FN.pipe(
        children,
        AR.map(([grid, rect]) => {
          const [{ top, left }, { width, height }] = [rect.pos, rect.size];
          const spacing = {
            top,
            right: Math.max(0, size.width - width - left),
            bottom: Math.max(0, size.height - height - top),
            left,
          };
          return FN.pipe(grid, expand(spacing));
        }),
      );

    const stacked = FN.pipe(tail, AR.reduce(head, stackAtMode));

    return stackAtMode(TY.isEmpty(parent) ? TY.sized(size) : parent, stacked);
  };

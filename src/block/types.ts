import { RowList } from 'src/types';
import { Align, align } from '../align';
import { Rect } from '../geometry';

export const defaultAlign = align.bottomLeft;

/**
 * Rows/cols will be shrinked or expanded if they need to be aligned:
 *
 * `block.size ≠ measureData(block.data)`
 *
 * Blocks will always render to its size regardless of its content.
 *
 * To set block size to content size, measure the content and set it as the
 * block size with `resetSize`.
 */

export interface Block extends Rect {
  rows: RowList;
  /**
   * Defines horizontal and vertical alignment of the string found in `data`,
   * when `block.size ≠ measureData(block.data)`
   */
  align: Align;
}

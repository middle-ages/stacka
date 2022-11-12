import {
  cellWords,
  closePrev,
  emptyPrev,
  isEmptyPrev,
  paintWith as paintCellWith,
  readPackedCell,
} from 'src/cell';
import { BinaryC } from 'util/function';
import { Grid } from './types';

export const paintWith: BinaryC<string, Grid, string[]> =
  (fillWith: string) =>
  ({ width, buffer }) => {
    if (buffer.length === 0) return [];

    const rowWords = cellWords * width,
      height = buffer.length / rowWords,
      rows = Array(height),
      read = readPackedCell(buffer),
      paintCell = paintCellWith(fillWith);

    let offset = 0;

    for (let y = 0; y < height; y++) {
      const row = Array(width);

      let prevStyle = emptyPrev;

      for (let x = 0; x < width; x++) {
        const [advance, cell] = read(offset);

        const [res, prev] = paintCell(cell, prevStyle);

        row[x] = res;
        prevStyle = prev;
        offset += advance;
      }

      const suffix = isEmptyPrev(prevStyle) ? '' : closePrev(prevStyle)('');
      rows[y] = row.join('') + suffix;
      prevStyle = emptyPrev;
    }

    return rows;
  };

export const paint = paintWith(' ');

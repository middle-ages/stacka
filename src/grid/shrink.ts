import { array as AR, function as FN, nonEmptyArray as NE } from 'fp-ts';
import { transpose } from 'fp-ts-std/Array';
import { fork } from 'fp-ts-std/Function';
import { Size } from 'src/geometry';
import { addAround, head, init, last, tail } from 'util/array';
import { Endo, Unary } from 'util/function';
import { Cell } from 'src/cell';
import * as TY from './types';
import { Grid } from './types';

const shrinkRow: Unary<number, Endo<Cell[]>> = width => row => {
  if (width === 0 || row.length === 0) return [];

  const gridWidth = row.length;

  if (gridWidth - width === 0) return row;

  const [begin, end] = FN.pipe(row, fork([head, last]));

  return width === 1
    ? [begin]
    : gridWidth === 1
    ? [begin, end]
    : FN.pipe(
        FN.pipe(
          NE.range(0, width - 1),
          AR.map(i => Math.ceil((gridWidth / width) * i)),
        ),
        AR.map(i => row[i]),
        init,
        tail,
        addAround([[begin], [end]]),
      );
};

const shrinkRows: Unary<number, Endo<Cell[][]>> = width => cells =>
  cells.length === 0 ? [] : FN.pipe(cells, FN.pipe(width, shrinkRow, AR.map));

/**
 * Shrink rows of cells to given size
 *
 * Shrinking a row by N cells will remove one cell every width/N cells.
 * Shrinking the row `1234` to `width=2`, for example, will return the row `13`.
 *
 */
export const shrinkCells: Unary<Size, Endo<Cell[][]>> = ({ width, height }) =>
  FN.flow(shrinkRows(width), transpose, shrinkRows(height), transpose);

/** The opposite of `stretch` */
export const shrink: Unary<Size, Endo<Grid>> = size =>
  FN.flow(TY.unpack, shrinkCells(size), TY.pack);

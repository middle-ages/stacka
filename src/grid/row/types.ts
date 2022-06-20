import { array as AR } from 'fp-ts';
import { BinaryC, Unary } from 'util/function';
import { cell, Cell } from '../cell/cell';

export type Row = Cell[];

export interface SplitResult {
  left: Row;
  right: Row;
  delta: number;
}

/** Returns a row of N cells all equal to the given cell */
export const uniRow: BinaryC<Cell, number, Row> = cell => count =>
  AR.replicate(count, cell);

/** Returns a row of N empty cells */
export const emptyN: Unary<number, Row> = uniRow(cell.empty);

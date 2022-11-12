import { function as FN, predicate as PRE } from 'fp-ts';
import * as CE from 'src/cell';
import { Cell } from 'src/cell';
import { Color } from 'src/color';
import { size as SZ, Size, Spacing } from 'src/geometry';
import { Unary } from 'util/function';

export interface Grid {
  width: number;
  buffer: Uint32Array;
}

export interface PaddedGrid {
  grid: Grid;
  spacing: Spacing;
}

export const countRows: Unary<Grid, number> = g =>
  g.width === 0 ? 0 : g.buffer.length / (CE.cellWords * g.width);

export const size: Unary<Grid, Size> = g => ({
  width: g.width,
  height: countRows(g),
});

export const empty: FN.Lazy<Grid> = () => ({
  width: 0,
  buffer: new Uint32Array(0),
});

export const sized: Unary<Size, Grid> = size => ({
  width: size.width,
  buffer: new Uint32Array(SZ.area(size) * CE.cellWords),
});

export const oneCell: Unary<Cell, Grid> = cell => {
  const grid = sized({ width: 1, height: 1 });
  CE.writeCell(grid.buffer)(0, cell);
  return grid;
};

export const isEmpty: PRE.Predicate<Grid> = ({ buffer }) =>
  buffer.byteLength === 0;

export const pack: Unary<Cell[][], Grid> = cells => {
  if (cells.length === 0 || cells[0].length === 0) return empty();

  const [width, height] = [cells[0].length, cells.length],
    buffer = sized({ width, height }).buffer,
    write = CE.writeCell(buffer);

  let offset = 0;

  for (let y = 0; y < height; y++) {
    const row = cells[y];
    for (let x = 0; x < width; x++) offset += write(offset, row[x]);
  }

  return { width, buffer };
};

export const unpack: Unary<Grid, Cell[][]> = g => {
  if (isEmpty(g)) return [];

  const read = CE.readCell(g.buffer);

  const { width, height } = size(g);

  const rows = Array(height);

  let offset = 0;

  for (let y = 0; y < height; y++) {
    const row = Array(width);
    rows[y] = row;

    for (let x = 0; x < width; x++) {
      row[x] = read(offset);
      offset += CE.cellWords;
    }
  }

  return rows;
};

export const spaceBg: Unary<Color, Grid> = FN.flow(CE.spaceBg, oneCell);

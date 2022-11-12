import { ansiToJson } from 'anser';
import { HAlign, matchHAlign } from 'src/align';
import * as CE from 'src/cell';
import { PackedCell } from 'src/cell';
import { Size } from 'src/geometry';
import { Binary, Unary } from 'util/function';
import { halfInt } from 'util/number';
import { Pair } from 'util/tuple';
import * as TY from './types';
import { Grid } from './types';

const parseChunks: Unary<string[], [Size, PackedCell[][]]> = lines => {
  let width = 0;
  const rows = lines.map(line => {
    let rowWidth = 0;
    const parsed = ansiToJson(line)
      .filter(a => !a.isEmpty())
      .flatMap(entry => {
        const [chunkWidth, rawCells] = CE.parseCells(entry);

        rowWidth += chunkWidth;
        return rawCells;
      });

    width = Math.max(width, rowWidth);

    return parsed;
  });

  return [{ width, height: rows.length }, rows];
};

export const parseRows: Binary<HAlign, string[], Grid> = (align, lines) => {
  if (lines.length === 0) return TY.empty();
  const [size, rows] = parseChunks(lines),
    { width, height } = size,
    grid = TY.sized(size),
    buffer = grid.buffer,
    writeEmpty = CE.writeEmptyCells(buffer),
    writeCell = CE.writePackedCell(buffer);

  let offset = 0;

  for (let y = 0; y < height; y++) {
    const row = rows[y],
      rowWidth = row.length,
      wΔ = Math.abs(width - rowWidth),
      [left, right] = matchHAlign<Pair<number>>([0, wΔ], halfInt(wΔ), [wΔ, 0])(
        align,
      );
    if (left !== 0) offset += writeEmpty(offset, left);

    for (let x = 0; x < rowWidth; x++) {
      const cell = row[x],
        type = cell[2];

      if (type !== 3) offset += writeCell(offset, row[x]);
    }

    if (right !== 0) offset += writeEmpty(offset, right);
  }

  return grid;
};

export const parseRow: Unary<string, Grid> = line =>
  line.length === 0 ? TY.empty() : parseRows('left', [line]);

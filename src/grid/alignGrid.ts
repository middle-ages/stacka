import { Align } from 'src/align';
import { Size } from 'src/geometry';
import { Binary, Endo } from 'util/function';
import { hAlignRow } from './hAlignRow';
import * as TY from './types';
import { Grid } from './types';
import { vAlignGrid } from './vAlignGrid';

/**
 * Given a size and alignment, resize and re-align the grid so that
 * it is sized and aligned as requested, regardless of the original
 * size or alignment
 */
export const alignGrid: Binary<Align, Size, Endo<Grid>> =
  ({ horizontal, vertical }, writeSize) =>
  rawGrid => {
    if (TY.isEmpty(rawGrid)) return rawGrid;

    const { height: writeH } = writeSize,
      [vAligned] = vAlignGrid(vertical, writeH)(rawGrid);

    const res = TY.sized(writeSize),
      align = hAlignRow(horizontal, [vAligned, res]);

    let [readIdx, writeIdx] = [0, 0];

    for (let y = 0; y < writeH; y++)
      [readIdx, writeIdx] = align([readIdx, writeIdx]);

    return res;
  };

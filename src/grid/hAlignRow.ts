import { align as AL, HAlign } from 'src/align';
import * as CE from 'src/cell';
import { Endo } from 'util/function';
import { Pair } from 'util/tuple';
import { hGaps } from './measure';
import { Grid } from './types';

/**
 * Horizontally align a row copying from read grid to write grid.
 *
 * Returns a function from `Pair<number> ⇒ Pair<number>` which takes and returns
 * the pair of read/write offsets.
 *
 */
export const hAlignRow = (
  hAlign: HAlign,
  [readGrid, writeGrid]: Pair<Grid>,
): Endo<Pair<number>> => {
  const gaps = hGaps(readGrid);

  return ([initRead, initWrite]: Pair<number>) => {
    const [readLeft, readRight] = gaps(initRead),
      [readW, writeW] = [readGrid.width, writeGrid.width];

    const readBodyW = readW - readLeft - readRight,
      writeGaps = writeW - readBodyW,
      writeLeft = AL.horizontally(hAlign, writeGaps)[0],
      crop = writeGaps >= 0 ? 0 : writeLeft,
      writeBodyW = readBodyW + crop;

    const [readIdx, writeIdx] = [
      initRead + (readLeft - crop) * CE.cellWords,
      initWrite + Math.max(0, writeLeft * CE.cellWords),
    ];

    CE.copyRow(writeBodyW)(
      readGrid.buffer,
      writeGrid.buffer,
      readIdx,
      writeIdx,
    );

    return [initRead + readW * CE.cellWords, initWrite + writeW * CE.cellWords];
  };
};

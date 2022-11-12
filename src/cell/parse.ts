import { AnserJsonEntry } from 'anser';
import { Unary } from 'util/function';
import stringWidth from 'string-width';
import * as ST from '../style';
import * as PA from './packed';
import { PackedCell } from './packed';
import { encode } from './rune';

export type ParsedChunk = [chunkCellCount: number, chunkCells: PackedCell[]];

const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });

export const parseCells: Unary<AnserJsonEntry, ParsedChunk> = entry => {
  const style = ST.fromParsed(entry);

  let chunkWidth = 0;

  const res = Array.from(segmenter.segment(entry.content), s => {
    const char = s.segment,
      charWidth = stringWidth(char),
      encoded = encode(char),
      isNarrow = charWidth === 1,
      isNone = isNarrow && encoded === 32 && ST.isEmpty(style);

    chunkWidth += charWidth;

    return [
      style,
      isNone ? 0 : encoded,
      isNone ? 0 : isNarrow ? 1 : 2,
    ] as PackedCell;
  }).flatMap(packedCell =>
    packedCell[2] === 2 ? [packedCell, PA.packedCont] : [packedCell],
  );

  return [chunkWidth, res];
};

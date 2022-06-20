import { function as FN } from 'fp-ts';
import { curry2 } from 'fp-ts-std/Function';
import { measureRowData, origin, Pos, Rect, rect } from 'src/geometry';
import { BinaryC } from 'util/function';
import { lines } from 'util/string';
import { Align, align } from '../align';
import { RowList } from '../types';
import { Block, defaultAlign } from './types';

export const buildBlock =
  (align: Align): BinaryC<Pos, RowList, Block> =>
  pos =>
  rows => ({
    ...FN.pipe(rows, measureRowData, FN.pipe(pos, curry2(rect))),
    align,
    rows,
  });

const atOrigin: BinaryC<Align, RowList, Block> = align =>
  FN.pipe(origin, FN.pipe(align, buildBlock));

const aligned = atOrigin(defaultAlign);

const fromRect =
  (align: Align): BinaryC<Rect, RowList, Block> =>
  rect =>
  rows => ({ ...rect, align, rows });

const empty = FN.pipe([], FN.pipe(rect.empty, fromRect(defaultAlign)));

export const builders = {
  atOrigin,
  aligned,
  centered: atOrigin(align.middleCenter),
  fromRow: FN.flow(lines, aligned),
  fromRect,
  empty,
} as const;

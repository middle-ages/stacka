import { function as FN } from 'fp-ts';
import { Unary } from 'util/function';
import { align } from '../align';
import { RowList, RowMapper } from '../types';
import { blockLens } from './lens';
import { Block } from './types';

/** Renders our data and aligns the result inside our rectangle */
export const paint: Unary<Block, RowList> = b => {
  const hAlign: RowMapper = FN.pipe(
    b.size,
    align.rowsWith(b.fillChar, b.align.horizontal),
  );

  const vAlign: RowMapper = FN.pipe(b.size, align.column(b.align.vertical));

  return FN.pipe(b, blockLens.rows.get, vAlign, hAlign);
};

import { function as FN } from 'fp-ts';
import { callWith, Endo } from 'util/function';
import { measureRowData } from '../geometry';
import { blockLens } from './lens';
import { Block } from './types';

const resetSize: Endo<Block> = callWith(
  FN.flow(blockLens.rows.get, measureRowData, blockLens.size.set),
);

export const ops = { resetSize } as const;

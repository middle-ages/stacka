import { function as FN } from 'fp-ts';
import { measureRowData } from '../geometry';
import { buildBlock, builders } from './build';
import { Show } from './instances';
import { blockLens } from './lens';
import { ops } from './ops';
import { paint } from './paint';

const fns = {
  ...builders,
  ...blockLens,
  ...ops,
  Show,
  show: Show.show,
  paint,
  measureBlock: FN.flow(blockLens.rows.get, measureRowData),
} as const;

export type block = typeof buildBlock & typeof fns;

export const block = buildBlock as block;

Object.assign(block, fns);

/*

export const paintBlockOf = <T>(pa: Painter<T>): Painter<Block<T>> => {
  const block = blockOf(pa);

  return {
    fillChar: pa.fillChar,
    pos: block.pos.get,
    size: block.size.get,
    paint: block.paint,
  };
};

export const paintRectBlock: Painter<Block<Rect>> = FN.pipe(
  paintRect,
  paintBlockOf,
);
*/

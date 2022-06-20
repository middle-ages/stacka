import { show as SH } from 'fp-ts';
import { format } from 'util/number';
import { orSpace } from 'util/string';
import { showAlign } from '../align';
import { showSize } from '../geometry';
import { Block } from './types';

export const Show: SH.Show<Block> = {
  show: b => {
    const { size, rows, align, fillChar } = b,
      sizeMsg = showSize.show(size),
      alignMsg = showAlign.show(align),
      dataMsg = format(rows.length),
      fillMsg = orSpace(fillChar) === ' ' ? '' : `, fillChar: “${fillChar}”`;

    return `Block(size:(${sizeMsg}), align:${alignMsg}, data: ${dataMsg}${fillMsg})`;
  },
};

import { string as STR, eq as EQ, function as FN, show as SH } from 'fp-ts';
import { unwords } from 'fp-ts-std/String';
import { grid } from 'src/grid';
import { showRect } from './rect';
import { Block } from './types';
import { rect } from 'src/geometry';
import { align } from 'src/align';
import { backdrop } from 'src/backdrop';

export const Show: SH.Show<Block> = {
  show: b => FN.pipe([showRect(b), grid.show.show(b.grid)], unwords),
};

export const show = Show.show;

export const eq: EQ.Eq<Block> = EQ.struct({
  grid: grid.eq,
  rect: rect.eq,
  align: align.eq,
  blend: STR.Eq,
  backdrop: backdrop.eq,
});

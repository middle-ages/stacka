import { string as STR, eq as EQ, function as FN, show as SH } from 'fp-ts';
import { unwords } from 'fp-ts-std/String';
import * as GR from 'src/grid';
import { showRect } from './rect';
import { Block } from './types';
import { rect } from 'src/geometry';
import { align } from 'src/align';
import * as BD from 'src/backdrop';

export const Show: SH.Show<Block> = {
  show: b => FN.pipe([showRect(b), GR.show.show(b.grid)], unwords),
};

export const show = Show.show;

export const eq: EQ.Eq<Block> = EQ.struct({
  grid: GR.eq,
  rect: rect.eq,
  align: align.eq,
  blend: STR.Eq,
  backdrop: BD.eq,
});

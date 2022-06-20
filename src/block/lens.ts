import { function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/lib/Lens';
import { align as al } from 'src/align';
import { rectLensFor } from 'src/geometry';
import { pipeLens } from 'util/lens';
import { Block } from './types';

const prop = <K extends keyof Block>(k: K) =>
  FN.pipe(LE.id<Block>(), LE.prop(k));

const align = prop('align'),
  rows = prop('rows');

export const blockLens = {
  ...rectLensFor<Block>(),
  rows,
  align,
  hAlign: FN.pipe(al.hLens, pipeLens(align)),
  vAlign: FN.pipe(al.vLens, pipeLens(align)),
} as const;

export type BlockLens = typeof blockLens;

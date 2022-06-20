import { function as FN } from 'fp-ts';
import * as LE from 'monocle-ts/lib/Lens';
import { Lens } from 'monocle-ts/lib/Lens';
import { Align, HAlign, VAlign } from './types';

const id = LE.id<Align>();

export const hLens: Lens<Align, HAlign> = FN.pipe(id, LE.prop('horizontal')),
  vLens: Lens<Align, VAlign> = FN.pipe(id, LE.prop('vertical'));

import { function as FN } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { canvasOpsOf } from './ops';
import { paintOf } from './paint';
import { Painter } from './types';

export const canvasOf = <T>(pa: Painter<T>) => {
  const [[build, ops], paint] = FN.pipe(pa, fork([canvasOpsOf, paintOf]));

  const fns = { ...ops, paint } as const;

  type Fns = typeof fns;

  type canvas = typeof build & Fns;

  const canvas = build as canvas;

  Object.assign(canvas, fns);

  return canvas;
};

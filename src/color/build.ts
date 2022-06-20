import { option as OP } from 'fp-ts';
import { Tuple3, Tuple4 } from 'util/tuple';
import { MaybeColor } from './named';
import { Hwba, Rgba } from './types';

export const rgba = ([r, g, b, a]: Tuple4<number>): Rgba => ({
  r,
  g,
  b,
  a,
});

export const hwba = ([h, w, b, a]: Tuple4<number>): Hwba => ({
  h,
  w,
  b,
  a,
});

export const rgb = (rgb: Tuple3<number>): Rgba => rgba([...rgb, 1]);

export const noColor: MaybeColor = OP.none;

import { array as AR, function as FN, nonEmptyArray as NE } from 'fp-ts';
import { Unary } from 'util/function';
import { normalize, Color } from './types';

export const grays: Color[] = FN.pipe(
  NE.range(0, 100),
  AR.map(l => normalize({ h: 0, s: 0, l })),
);

export const rainbowN: Unary<number, Color[]> = n =>
  FN.pipe(
    NE.range(0, n - 1),
    AR.map(h => normalize({ h: Math.round((h * 360) / n + 1), s: 100, l: 50 })),
  );

export const cycle: Unary<Color[], FN.Lazy<Color>> = colors => {
  let idx = 0;
  return () => {
    const res = colors[idx++];
    if (idx === colors.length) idx = 0;
    return res;
  };
};

export const rainbow6 = rainbowN(6),
  rainbow8 = rainbowN(8);

export const rainbow6Gen = () => cycle(rainbow6),
  rainbow8Gen = () => cycle(rainbow8);

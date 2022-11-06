import { array as AR, function as FN, nonEmptyArray as NE } from 'fp-ts';
import { Unary } from 'util/function';
import * as BU from './build';
import { Color } from './named';

export const rainbowN: Unary<number, Color[]> = n =>
  FN.pipe(
    NE.range(0, n - 1),
    AR.map(h => Math.round((h * 360) / n + 1)),
    AR.map(h => BU.hwba([h, 0, 0, 1])),
  );

export const cycle: Unary<Color[], FN.Lazy<Color>> = colors => {
  let idx = 0;
  return () => {
    const res = colors[idx++];
    if (idx === colors.length) idx = 0;
    return res;
  };
};

export const rainbow8 = rainbowN(8);

export const rainbow8Gen = () => cycle(rainbow8);

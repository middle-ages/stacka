import { RgbaColor } from 'colord';
import * as fc from 'fast-check';
import { assert } from 'vitest';
import { ColorBin, RgbaTuple } from '../rgba';
import { Color, toRgbaColor } from '../types';

export const byteArb = fc.nat(2 ** 8 - 1);

export const realArb = fc.float(0, 1);

export const colorBinArb: fc.Arbitrary<ColorBin> = fc.nat(2 ** 32 - 1);

export const rgbaColorArb: fc.Arbitrary<RgbaColor> = fc.record({
  r: byteArb,
  g: byteArb,
  b: byteArb,
  a: realArb,
});

export const rgbaTupleArb: fc.Arbitrary<RgbaTuple> = fc.tuple(
  byteArb,
  byteArb,
  byteArb,
  byteArb,
);

export const hueArb: fc.Arbitrary<number> = fc.nat(360);

export const colorEq = (a: Color, b: Color) =>
  assert.deepEqual(toRgbaColor(a), toRgbaColor(b));

import * as fc from 'fast-check';
import { Deco } from '../deco';
import { colorBinArb } from 'src/color/tests/helpers';
import { Style } from '../types';

export * from 'src/color/tests/helpers';

export const decoArb: fc.Arbitrary<Deco> = fc.nat(2 ** 5 - 1);

export const styleArb: fc.Arbitrary<Style> = fc.tuple(
  colorBinArb,
  colorBinArb,
  decoArb,
);

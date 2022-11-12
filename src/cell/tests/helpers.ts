import * as fc from 'fast-check';
import { array as AR, function as FN } from 'fp-ts';
import { mapBoth } from 'fp-ts-std/Tuple';
import { Pair } from 'util/tuple';
import * as BU from '../build';
import { Cell } from '../types';
import { styleArb } from 'src/style/tests/helpers';

export * from 'src/color/tests/helpers';
export * from 'src/style/tests/helpers';

type ArbCells = fc.Arbitrary<Cell[]>;

const emojiK: Pair<fc.Arbitrary<string>> = FN.pipe(
  ['🙂', '😢'],
  mapBoth(fc.constant),
);

const wideArb: fc.Arbitrary<Cell[]> = fc
  .tuple(styleArb, fc.oneof(...emojiK))
  .map(BU.wide);

const charArb: fc.Arbitrary<Cell> = fc
  .tuple(styleArb, fc.char())
  .map(BU.narrow);

export const narrowOrNoneArb: fc.Arbitrary<Cell> = fc.oneof(
  charArb,
  fc.constant(BU.none),
);

export const cellArb: ArbCells = fc.oneof(
  narrowOrNoneArb.map(AR.of),
  wideArb,
  fc.constant([BU.cont]),
);

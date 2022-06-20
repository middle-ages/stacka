import {
  ord as OD,
  function as FN,
  array as AR,
  nonEmptyArray as NE,
  eq as EQ,
  number as NU,
} from 'fp-ts';
import { Unary } from 'util/function';

export * from './relation/types';
export * from './relation/build';
export * from './relation/defs';
export * from './relation/create';

const ordSize: OD.Ord<string[]> = FN.pipe(
    NU.Ord,
    OD.contramap<number, string[]>(AR.size),
  ),
  eqSize: EQ.Eq<string[]> = FN.pipe(
    NU.Eq,
    EQ.contramap<number, string[]>(AR.size),
  );

export const chainsBySize: Unary<string[][], string[][][]> = FN.flow(
  AR.sort(ordSize),
  NE.group(eqSize),
);

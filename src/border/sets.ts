import { function as FN, readonlyArray as RA } from 'fp-ts';
import { toSnd } from 'fp-ts-std/Tuple';
import { bitmap } from 'src/bitmap';
import { Unary } from 'util/function';
import { typedFromEntries } from 'util/object';
import { fromNarrowChars } from './build';
import { borderLines } from './lines';
import {
  Border,
  BorderName,
  borderNames,
  CharParts,
  DashBorderName,
  isDashBorderName,
  NoDashBorderName,
} from './types';

const noDashBorderName = (n: DashBorderName): NoDashBorderName =>
  n.startsWith('round') ? 'round' : n.startsWith('thick') ? 'thick' : 'line';

const byName: Unary<BorderName, CharParts> = name => ({
  ...bitmap.elbowByGroup(
    isDashBorderName(name) ? noDashBorderName(name) : name,
  ),
  ...borderLines(name),
});

const makeBorder: Unary<BorderName, [BorderName, Border]> = FN.pipe(
  FN.flow(byName, fromNarrowChars),
  toSnd,
);

export const sets: Record<BorderName, Border> = FN.pipe(
  borderNames,
  RA.map(makeBorder),
  typedFromEntries,
);

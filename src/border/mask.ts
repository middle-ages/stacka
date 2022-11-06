import { array as AR, function as FN, option as OP } from 'fp-ts';
import { fork } from 'fp-ts-std/Function';
import { mapBoth } from 'fp-ts-std/Tuple';
import { box, Box } from 'src/box';
import { orientations, BorderDir, borderDir, dir } from 'src/geometry';
import { Endo, Unary } from 'util/function';
import { Pair, Tuple4 } from 'util/tuple';
import { setOrientEdges, unsetEdge, unsetOrientEdges } from './edge';
import { setCorners, setMaybeHParts, setMaybeVParts, setPart } from './part';
import { Border, EdgeParts } from './types';

/** A mask removes some predefined parts of a border */

const noCorners: Endo<Border> = setCorners(
  AR.replicate(4, box.cell) as Tuple4<Box>,
);

const [noHLines, noVLines]: Pair<Endo<Border>> = FN.pipe(
  box.cell,
  OP.some,
  fork([setMaybeHParts, setMaybeVParts]),
);

const noLines = FN.flow(noHLines, noVLines);

export const noPartAt: Unary<BorderDir, Endo<Border>> = d =>
  FN.pipe(box.cell, setPart(d));

const [
  noPartTL,
  noPartT,
  noPartTR,
  noPartR,
  noPartBR,
  noPartB,
  noPartBL,
  noPartL,
] = borderDir.map(noPartAt);

const [openT, openR, openB, openL] = dir.map(unsetEdge);

const [noVEdges, noHEdges]: Pair<Endo<Border>> = FN.pipe(
  orientations,
  mapBoth(unsetOrientEdges),
);

export const [setVEdges, setHEdges]: Pair<Unary<EdgeParts, Endo<Border>>> =
  FN.pipe(orientations, mapBoth(setOrientEdges));

export const mask = {
  noCorners,
  noLines,
  noHLines,
  noVLines,
  noHEdges,
  noVEdges,
  openT,
  openR,
  openB,
  openL,
  noPartTL,
  noPartT,
  noPartTR,
  noPartR,
  noPartBR,
  noPartB,
  noPartBL,
  noPartL,
} as const;

export type Mask = keyof typeof mask;
